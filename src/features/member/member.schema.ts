import { z } from "zod"

export const SendInvitationSchema = z.object({
  organizationId: z.string().uuid("Organização inválida"),
  email: z.string().trim().email("E-mail inválido"),
})

export type SendInvitationInput = z.infer<typeof SendInvitationSchema>
