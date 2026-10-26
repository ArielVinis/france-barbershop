import { z } from "zod"

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  memberId: z.string().uuid(),
  date: z.coerce.date(),
  observations: z.string().optional(),
})

export const DeleteBookingSchema = z.object({
  bookingId: z.string().uuid(),
})

export const CreatePanelBookingSchema = z
  .object({
    clientUserId: z.string().uuid().optional(),
    walkInName: z.string().trim().min(1).optional(),
    walkInPhone: z.string().trim().min(8).optional(),
    serviceId: z.string().uuid(),
    memberId: z.string().uuid(),
    date: z.coerce.date(),
    observations: z.string().optional(),
  })
  .refine((d) => d.clientUserId || (d.walkInName && d.walkInPhone), {
    message: "Selecione um cliente ou preencha nome e telefone",
  })

export const UpdatePanelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  serviceId: z.string().uuid(),
  memberId: z.string().uuid(),
  date: z.coerce.date(),
  observations: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type CreatePanelBookingInput = z.infer<typeof CreatePanelBookingSchema>
export type UpdatePanelBookingInput = z.infer<typeof UpdatePanelBookingSchema>
