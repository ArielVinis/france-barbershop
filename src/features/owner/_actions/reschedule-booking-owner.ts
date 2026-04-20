"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError, requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

/**
 * Permite ao dono realocar um agendamento (alterar data/hora e opcionalmente o barbeiro).
 * Apenas agendamentos CONFIRMED ou IN_PROGRESS podem ser realocados.
 */
export async function rescheduleBookingOwner(
  bookingId: string,
  newDate: Date,
  barberId?: string | null,
) {
  const user = await getCurrentUser()

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { barbershopId: true } },
    },
  })

  if (!booking) throw new NotFoundError("Agendamento não encontrado")

  try {
    await requireBarbershopForOwner(user.id, booking.service.barbershopId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este agendamento")
    }
    throw error
  }

  const allowedStatuses = ["CONFIRMED", "IN_PROGRESS"]
  if (!allowedStatuses.includes(booking.status)) {
    throw new Error(
      "Só é possível realocar agendamentos confirmados ou em andamento",
    )
  }

  if (barberId) {
    const barber = await db.barber.findUnique({
      where: { id: barberId },
      select: { barbershopId: true },
    })
    if (!barber) throw new NotFoundError("Barbeiro não encontrado")
    if (barber.barbershopId !== booking.service.barbershopId) {
      throw new ForbiddenError(
        "Você não tem acesso ao barbeiro informado para este agendamento",
      )
    }
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      date: newDate,
      ...(barberId !== undefined ? { barberId: barberId || null } : {}),
    },
  })

  revalidatePath(PATHS.PANEL.ROOT)
}
