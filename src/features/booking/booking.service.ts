import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/prisma/generated/prisma/client"
import {
  assertNoBarberBookingConflict,
  assertNoOrganizationScheduleConflict,
} from "@/src/features/booking/_lib/booking-conflict"
import { bookingRepository } from "@/src/features/booking/booking.repository"
import type { CreateBookingInput } from "@/src/features/booking/booking.schema"
import type {
  OwnerBookingsPeriod,
  UpdateBookingStatusOptions,
} from "@/src/features/booking/booking.types"
import { ForbiddenError, NotFoundError } from "@/src/shared/errors/errors"
import { resolveOwnerOrganizationIdsForQueries } from "@/src/shared/guards/panel/resolve-owner-organization-ids"
import { requireOrganizationForOwner } from "@/src/shared/guards/require-organization-for-owner"
import type { OwnerOrganizationIdList } from "@/src/shared/types/panel-data-scope"

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["FINISHED", "CANCELLED", "NO_SHOW"],
  FINISHED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

function buildStatusUpdateData(
  status: BookingStatus,
  options?: UpdateBookingStatusOptions,
) {
  const data: {
    status: BookingStatus
    paymentMethod?: PaymentMethod
    paymentStatus?: PaymentStatus
  } = { status }

  if (status === "FINISHED" && options) {
    if (options.paymentMethod != null) data.paymentMethod = options.paymentMethod
    if (options.paymentStatus != null)
      data.paymentStatus = options.paymentStatus ?? "PAID"
  }

  return data
}

function assertStatusTransition(
  current: BookingStatus,
  next: BookingStatus,
) {
  const allowed = STATUS_TRANSITIONS[current]
  if (!allowed?.includes(next)) {
    throw new Error(
      `Não é possível alterar de ${current} para ${next}`,
    )
  }
}

export const bookingService = {
  async createBooking(input: CreateBookingInput, userId: string) {
    const { serviceId, memberId, date } = input

    await bookingRepository.transaction(async (tx) => {
      const service = await tx.organizationService.findUnique({
        where: { id: serviceId },
        select: { organizationId: true, durationMinutes: true },
      })
      if (!service) {
        throw new Error("Serviço não encontrado")
      }

      const barberMember = await tx.member.findFirst({
        where: {
          id: memberId,
          organizationId: service.organizationId,
          role: "MEMBER",
          isActive: true,
        },
      })
      if (!barberMember) {
        throw new Error("Barbeiro inválido para este serviço")
      }

      await assertNoOrganizationScheduleConflict(
        tx,
        service.organizationId,
        date,
        service.durationMinutes,
      )

      await assertNoBarberBookingConflict(
        tx,
        memberId,
        date,
        service.durationMinutes,
      )

      await tx.booking.create({
        data: {
          serviceId,
          memberId,
          date,
          userId,
        },
      })
    })
  },

  async deleteBooking(bookingId: string, userId: string) {
    const result = await bookingRepository.deleteConfirmedFutureBooking(
      bookingId,
      userId,
    )

    if (result.count === 0) {
      const existing = await bookingRepository.findBookingUserId(bookingId)

      if (!existing) {
        throw new NotFoundError("Agendamento não encontrado")
      }

      if (existing.userId !== userId) {
        throw new ForbiddenError(
          "Você não tem permissão para cancelar este agendamento",
        )
      }

      throw new Error("Só é possível cancelar agendamentos confirmados e futuros")
    }
  },

  getBookings(params: {
    serviceId: string
    date: Date
    memberId?: string
  }) {
    return bookingRepository.findBookingsByServiceAndDate(params)
  },

  getConfirmedBookings(userId: string) {
    return bookingRepository.findConfirmedBookingsForUser(userId)
  },

  getConcludedBookings(userId: string) {
    return bookingRepository.findConcludedBookingsForUser(userId)
  },

  getOwnerBookings(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      memberId?: string | null
      period: OwnerBookingsPeriod
      date: Date
    },
  ) {
    const shopIds = resolveOwnerOrganizationIdsForQueries(
      organizationIds,
      options.organizationId,
    )
    if (shopIds.length === 0) return []
    return bookingRepository.findOwnerBookings(shopIds, options)
  },

  getBarberBookings(
    memberId: string,
    period: OwnerBookingsPeriod,
    date: Date,
  ) {
    return bookingRepository.findBarberBookings(memberId, period, date)
  },

  async updateBookingStatus(
    bookingId: string,
    memberId: string,
    status: BookingStatus,
    options?: UpdateBookingStatusOptions,
  ) {
    const booking = await bookingRepository.findBookingForBarber(
      bookingId,
      memberId,
    )
    if (!booking) {
      throw new Error("Agendamento não encontrado")
    }

    assertStatusTransition(booking.status, status)

    await bookingRepository.updateBookingStatus(
      bookingId,
      buildStatusUpdateData(status, options),
    )
  },

  async updateBookingStatusOwner(
    bookingId: string,
    ownerUserId: string,
    status: BookingStatus,
    options?: UpdateBookingStatusOptions,
  ) {
    const booking = await bookingRepository.findBookingWithOrganization(bookingId)
    if (!booking) throw new NotFoundError("Agendamento não encontrado")

    try {
      await requireOrganizationForOwner(
        ownerUserId,
        booking.service.organizationId,
      )
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a este agendamento")
      }
      throw error
    }

    assertStatusTransition(booking.status, status)

    await bookingRepository.updateBookingStatus(
      bookingId,
      buildStatusUpdateData(status, options),
    )
  },

  async rescheduleBookingOwner(
    bookingId: string,
    ownerUserId: string,
    newDate: Date,
    barberId?: string | null,
  ) {
    const booking = await bookingRepository.findBookingForReschedule(bookingId)
    if (!booking) throw new NotFoundError("Agendamento não encontrado")

    try {
      await requireOrganizationForOwner(
        ownerUserId,
        booking.service.organizationId,
      )
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
      const barber = await bookingRepository.findBarberMember(barberId)
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

    await bookingRepository.transaction(async (tx) => {
      await assertNoOrganizationScheduleConflict(
        tx,
        booking.service.organizationId,
        newDate,
        booking.service.durationMinutes,
      )

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
  },
}
