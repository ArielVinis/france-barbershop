"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError } from "@/src/lib/authz/errors"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

const DeleteBookingSchema = z.object({
  bookingId: z.string().uuid(),
})

export const deleteBooking = async (bookingId: string) => {
  const parsed = DeleteBookingSchema.safeParse({ bookingId })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  const result = await db.booking.deleteMany({
    where: {
      id: parsed.data.bookingId,
      userId: session.user.id,
      status: "CONFIRMED",
      date: { gt: new Date() },
    },
  })

  if (result.count === 0) {
    const existing = await db.booking.findUnique({
      where: { id: parsed.data.bookingId },
      select: { userId: true },
    })

    if (!existing) {
      throw new NotFoundError("Agendamento não encontrado")
    }

    if (existing.userId !== session.user.id) {
      throw new ForbiddenError(
        "Você não tem permissão para cancelar este agendamento",
      )
    }

    throw new Error("Só é possível cancelar agendamentos confirmados e futuros")
  }

  revalidatePath(PATHS.BOOKINGS.ROOT)
}
