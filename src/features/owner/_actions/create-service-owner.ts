"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentUser } from "@/src/lib/auth"
import { resolvePanelContext } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

const CreateServiceOwnerSchema = z.object({
  barbershopId: z.string().min(1, "Barbearia é obrigatória"),
  name: z.string().trim().min(1, "Nome do serviço é obrigatório"),
  description: z.string().trim(),
  imageUrl: z.string().trim(),
  price: z.coerce.number().min(0, "Preço não pode ser negativo"),
  durationMinutes: z.coerce
    .number()
    .int("Duração deve ser um número inteiro")
    .min(1, "Duração mínima é 1 minuto"),
})

export type CreateServiceOwnerInput = z.infer<typeof CreateServiceOwnerSchema>

export async function createServiceOwner(input: CreateServiceOwnerInput) {
  const parsed = CreateServiceOwnerSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(msg)
  }

  const data = parsed.data

  const user = await getCurrentUser()
  const ctx = await resolvePanelContext(user, { shopId: data.barbershopId })
  if (!ctx || ctx.role !== "OWNER") {
    throw new Error("Barbearia não encontrada ou você não é o dono")
  }

  const imageUrl = data.imageUrl || "/banner.png"
  const description = data.description || data.name

  await db.barbershopService.create({
    data: {
      barbershopId: ctx.barbershopId,
      name: data.name,
      description,
      imageUrl,
      price: data.price,
      durationMinutes: data.durationMinutes,
    },
  })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
}
