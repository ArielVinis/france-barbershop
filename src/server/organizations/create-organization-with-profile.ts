"use server"

import { revalidatePath } from "next/cache"
import { Role } from "@/prisma/generated/prisma/enums"
import { z } from "zod"
import { auth } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { getCurrentUser } from "@/src/server/auth/users"
import { headers } from "next/headers"
import { PATHS } from "@/src/constants/PATHS"

const CreateOrganizationWithProfileSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug só pode conter letras minúsculas, números e hífens",
    ),
  logo: z.union([z.string().url(), z.literal("")]).optional(),
  description: z.string().trim().default(""),
  address: z.string().trim().min(1, "Morada é obrigatória"),
  phones: z
    .array(z.string().trim().min(1))
    .min(1, "Informe pelo menos um telefone"),
})

export type CreateOrganizationWithProfileInput = z.infer<
  typeof CreateOrganizationWithProfileSchema
>

export type CreateOrganizationWithProfileResult =
  | { success: true; organizationId: string }
  | { success: false; error: string }

/**
 * Cria organization + perfil da barbearia + vínculo OWNER numa transação Prisma.
 * Depois define a org como ativa na sessão (Better Auth).
 */
export async function createOrganizationWithProfile(
  input: CreateOrganizationWithProfileInput,
): Promise<CreateOrganizationWithProfileResult> {
  const parsed = CreateOrganizationWithProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    }
  }

  const data = parsed.data
  const { user } = await getCurrentUser()

  const slugTaken = await db.organization.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (slugTaken) {
    return { success: false, error: "Este slug já está em uso" }
  }

  try {
    const organization = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo && data.logo !== "" ? data.logo : null,
          description: data.description,
          address: data.address,
          phones: data.phones,
        },
      })

      const existingMember = await tx.member.findFirst({
        where: {
          organizationId: org.id,
          userId: user.id,
        },
      })

      if (!existingMember) {
        await tx.member.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            role: Role.OWNER,
            isActive: true,
          },
        })
      } else if (existingMember.role !== Role.OWNER) {
        await tx.member.update({
          where: { id: existingMember.id },
          data: { role: Role.OWNER, isActive: true },
        })
      }

      if (user.role === Role.CLIENT) {
        await tx.user.update({
          where: { id: user.id },
          data: { role: Role.OWNER },
        })
      }

      return org
    })

    const requestHeaders = await headers()
    await auth.api.setActiveOrganization({
      body: { organizationId: organization.id },
      headers: requestHeaders,
    })

    revalidatePath(PATHS.ROOT)
    revalidatePath(PATHS.PANEL.ROOT)

    return { success: true, organizationId: organization.id }
  } catch (error) {
    console.error("createOrganizationWithProfile", error)
    return {
      success: false,
      error: "Não foi possível criar a barbearia. Tente novamente.",
    }
  }
}
