import { z } from "zod"

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z
    .union([
      z.string().trim().min(8, "Informe um telefone válido"),
      z.literal(""),
    ])
    .optional(),
})

export const ChangeEmailSchema = z.object({
  newEmail: z.string().trim().email("E-mail inválido"),
  callbackPath: z.string().startsWith("/").optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type ChangeEmailInput = z.infer<typeof ChangeEmailSchema>

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string }

export type ChangeEmailResult =
  | { success: true; message: string }
  | { success: false; error: string }

export type UploadAvatarResult =
  | { success: true; imageUrl: string }
  | { success: false; error: string }
