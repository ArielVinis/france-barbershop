import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { Role } from "@/prisma/generated/prisma/enums"
import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/prisma/generated/prisma/client"
import { db } from "@/src/shared/lib/prisma"
import type { OwnerBookingsPeriod } from "@/src/features/booking/booking.types"

function periodBounds(period: OwnerBookingsPeriod, date: Date) {
  const start =
    period === "day"
      ? startOfDay(date)
      : period === "week"
        ? startOfWeek(date, { weekStartsOn: 0 })
        : startOfMonth(date)
  const end =
    period === "day"
      ? endOfDay(date)
      : period === "week"
        ? endOfWeek(date, { weekStartsOn: 0 })
        : endOfMonth(date)
  return { start, end }
}

export const bookingRepository = {
  findServiceById(serviceId: string) {
    return db.organizationService.findUnique({
      where: { id: serviceId },
      select: { organizationId: true, durationMinutes: true },
    })
  },

  findActiveBarberMember(memberId: string, organizationId: string) {
    return db.member.findFirst({
      where: {
        id: memberId,
        organizationId,
        role: Role.MEMBER,
        isActive: true,
      },
    })
  },

  createBooking(data: {
    serviceId: string
    memberId: string
    date: Date
    userId: string
  }) {
    return db.booking.create({ data })
  },

  deleteConfirmedFutureBooking(bookingId: string, userId: string) {
    return db.booking.deleteMany({
      where: {
        id: bookingId,
        userId,
        status: "CONFIRMED",
        date: { gt: new Date() },
      },
    })
  },

  findBookingUserId(bookingId: string) {
    return db.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    })
  },

  findBookingsByServiceAndDate(params: {
    serviceId: string
    date: Date
    memberId?: string
  }) {
    const { serviceId, date, memberId } = params
    return db.booking.findMany({
      where: {
        serviceId,
        ...(memberId ? { memberId } : {}),
        date: {
          lte: endOfDay(date),
          gte: startOfDay(date),
        },
      },
    })
  },

  findConfirmedBookingsForUser(userId: string) {
    return db.booking.findMany({
      where: {
        userId,
        date: { gte: new Date() },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
      include: {
        service: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })
  },

  findConcludedBookingsForUser(userId: string) {
    return db.booking.findMany({
      where: {
        userId,
        OR: [
          { date: { lt: new Date() } },
          { status: { in: ["FINISHED", "CANCELLED", "NO_SHOW"] } },
        ],
      },
      include: {
        service: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })
  },

  findOwnerBookings(
    shopIds: string[],
    options: {
      memberId?: string | null
      period: OwnerBookingsPeriod
      date: Date
    },
  ) {
    const { period, date, memberId } = options
    const { start, end } = periodBounds(period, date)

    return db.booking.findMany({
      where: {
        service: { organizationId: { in: shopIds } },
        ...(memberId ? { memberId } : {}),
        date: { gte: start, lte: end },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
            organizationId: true,
          },
        },
        member: {
          select: {
            id: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    })
  },

  findBarberBookings(
    memberId: string,
    period: OwnerBookingsPeriod,
    date: Date,
  ) {
    const { start, end } = periodBounds(period, date)

    return db.booking.findMany({
      where: {
        memberId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
      },
      orderBy: { date: "asc" },
    })
  },

  findBookingForBarber(bookingId: string, memberId: string) {
    return db.booking.findFirst({
      where: { id: bookingId, memberId },
    })
  },

  findBookingWithOrganization(bookingId: string) {
    return db.booking.findUnique({
      where: { id: bookingId },
      include: { service: { select: { organizationId: true } } },
    })
  },

  findBookingForReschedule(bookingId: string) {
    return db.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { select: { organizationId: true, durationMinutes: true } },
      },
    })
  },

  findBarberMember(barberId: string) {
    return db.member.findFirst({
      where: {
        id: barberId,
        role: Role.MEMBER,
        isActive: true,
      },
      select: { organizationId: true },
    })
  },

  updateBookingStatus(
    bookingId: string,
    data: {
      status: BookingStatus
      paymentMethod?: PaymentMethod
      paymentStatus?: PaymentStatus
    },
  ) {
    return db.booking.update({
      where: { id: bookingId },
      data,
    })
  },

  rescheduleBooking(
    bookingId: string,
    organizationId: string,
    data: { date: Date; memberId?: string | null },
    allowedStatuses: readonly BookingStatus[],
  ) {
    return db.booking.updateMany({
      where: {
        id: bookingId,
        status: { in: [...allowedStatuses] },
        service: { organizationId },
      },
      data: {
        date: data.date,
        ...(data.memberId !== undefined ? { memberId: data.memberId || null } : {}),
      },
    })
  },

  transaction<T>(fn: Parameters<typeof db.$transaction>[0]) {
    return db.$transaction(fn)
  },
}
