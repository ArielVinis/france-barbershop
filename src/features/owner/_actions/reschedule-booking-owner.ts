"use server"

import { Role } from "@/prisma/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import {
  ForbiddenError,
  NotFoundError,
  requireOrganizationForOwner,
} from "@/src/lib/authz"
import { assertNoBarberBookingConflict } from "@/src/lib/booking-conflict"
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
  const { user } = await getCurrentUser()

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { organizationId: true, durationMinutes: true } },
    },
  })

  if (!booking) throw new NotFoundError("Agendamento não encontrado")

  try {
    await requireOrganizationForOwner(user.id, booking.service.organizationId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este agendamento")
    }
    throw error
  }

  const allowedStatuses = ["CONFIRMED", "IN_PROGRESS"] as const
  if (
    !allowedStatuses.includes(
      booking.status as (typeof allowedStatuses)[number],
    )
  ) {
    throw new Error(
      "Só é possível realocar agendamentos confirmados ou em andamento",
    )
  }

  if (barberId) {
    const barber = await db.member.findFirst({
      where: {
        id: barberId,
        role: Role.MEMBER,
        isActive: true,
      },
      select: { organizationId: true },
    })
    if (!barber) throw new NotFoundError("Barbeiro não encontrado")
    if (barber.organizationId !== booking.service.organizationId) {
      throw new ForbiddenError(
        "Você não tem acesso ao barbeiro informado para este agendamento",
      )
    }
  }

  const targetMemberId = barberId !== undefined ? barberId : booking.memberId
  if (!targetMemberId) {
    throw new Error("É necessário informar um barbeiro para este agendamento")
  }

  await db.$transaction(async (tx) => {
    await assertNoBarberBookingConflict(
      tx,
      targetMemberId,
      newDate,
      booking.service.durationMinutes,
      bookingId,
    )

    const result = await tx.booking.updateMany({
      where: {
        id: bookingId,
        status: { in: [...allowedStatuses] },
        service: { organizationId: booking.service.organizationId },
      },
      data: {
        date: newDate,
        ...(barberId !== undefined ? { memberId: barberId || null } : {}),
      },
    })

    if (result.count === 0) {
      throw new Error("Não foi possível realocar este agendamento")
    }
  })

  revalidatePath(PATHS.PANEL.ROOT)
}
