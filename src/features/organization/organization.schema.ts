import { z } from "zod"

export const CreateOrganizationWithProfileSchema = z.object({
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
