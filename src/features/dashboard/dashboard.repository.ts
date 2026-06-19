import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { db } from "@/src/shared/lib/prisma"
import type {
  OwnerChartPeriod,
  OwnerStatsPeriod,
} from "@/src/features/dashboard/dashboard.types"

function periodBounds(period: OwnerStatsPeriod | OwnerChartPeriod, date: Date) {
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

export const dashboardRepository = {
  findPaidBookingsForShops(shopIds: string[], start: Date, end: Date) {
    return db.booking.findMany({
      where: {
        service: { organizationId: { in: shopIds } },
        date: { gte: start, lte: end },
        paymentStatus: "PAID",
      },
      select: {
        date: true,
        service: {
          select: {
            price: true,
            organizationId: true,
            organization: { select: { name: true } },
          },
        },
      },
    })
  },

  findBookingsForShops(shopIds: string[], start: Date, end: Date) {
    return db.booking.findMany({
      where: {
        service: { organizationId: { in: shopIds } },
        date: { gte: start, lte: end },
      },
      select: { id: true, date: true },
    })
  },

  countActiveBarbers(shopIds: string[]) {
    return db.member.count({
      where: {
        organizationId: { in: shopIds },
        role: "MEMBER",
        isActive: true,
      },
    })
  },

  groupBookingsByService(shopIds: string[], start: Date, end: Date) {
    return db.booking.groupBy({
      by: ["serviceId"],
      where: {
        service: { organizationId: { in: shopIds } },
        date: { gte: start, lte: end },
      },
      _count: { id: true },
    })
  },

  findServicesByIds(serviceIds: string[]) {
    return db.organizationService.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    })
  },

  findOrganizationName(organizationId: string) {
    return db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    })
  },

  findBarberPaidBookings(
    organizationId: string,
    memberId: string,
    start: Date,
    end: Date,
  ) {
    return db.booking.findMany({
      where: {
        memberId,
        service: { organizationId },
        date: { gte: start, lte: end },
        paymentStatus: "PAID",
      },
      select: {
        date: true,
        service: {
          select: {
            price: true,
            organizationId: true,
            organization: { select: { name: true } },
          },
        },
      },
    })
  },

  findBarberBookings(
    organizationId: string,
    memberId: string,
    start: Date,
    end: Date,
  ) {
    return db.booking.findMany({
      where: {
        memberId,
        service: { organizationId },
        date: { gte: start, lte: end },
      },
      select: { id: true, date: true },
    })
  },

  groupBarberBookingsByService(
    organizationId: string,
    memberId: string,
    start: Date,
    end: Date,
  ) {
    return db.booking.groupBy({
      by: ["serviceId"],
      where: {
        memberId,
        service: { organizationId },
        date: { gte: start, lte: end },
      },
      _count: { id: true },
    })
  },

  findMemberName(memberId: string) {
    return db.member.findUnique({
      where: { id: memberId },
      select: { user: { select: { name: true } } },
    })
  },

  groupBookingsByMember(shopIds: string[], start: Date, end: Date) {
    return db.booking.groupBy({
      by: ["memberId"],
      where: {
        service: { organizationId: { in: shopIds } },
        date: { gte: start, lte: end },
        memberId: { not: null },
      },
      _count: { id: true },
    })
  },

  findMembersByIds(memberIds: string[]) {
    return db.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, user: { select: { name: true } } },
    })
  },

  periodBounds,
  eachDayOfInterval,
  format,
}
