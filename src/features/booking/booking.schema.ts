import { z } from "zod"

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  memberId: z.string().uuid(),
  date: z.coerce.date(),
})

export const DeleteBookingSchema = z.object({
  bookingId: z.string().uuid(),
})

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
