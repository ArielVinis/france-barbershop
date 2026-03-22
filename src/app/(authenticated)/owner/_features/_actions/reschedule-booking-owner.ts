"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

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

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      service: {
        barbershop: {
          owners: { some: { id: user.id } },
        },
      },
    },
    include: {
      service: { select: { barbershopId: true } },
    },
  })

  if (!booking) {
    throw new Error("Agendamento não encontrado")
  }

  const allowedStatuses = ["CONFIRMED", "IN_PROGRESS"]
  if (!allowedStatuses.includes(booking.status)) {
    throw new Error(
      "Só é possível realocar agendamentos confirmados ou em andamento",
    )
  }

  if (barberId) {
    const barber = await db.barber.findFirst({
      where: {
        id: barberId,
        barbershopId: booking.service.barbershopId,
      },
    })
    if (!barber) {
      throw new Error("Barbeiro não pertence à barbearia deste agendamento")
    }
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      date: newDate,
      ...(barberId !== undefined ? { barberId: barberId || null } : {}),
    },
  })

  revalidatePath("/owner")
}
