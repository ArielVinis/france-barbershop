"use server"

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns"
import { db } from "@/src/lib/prisma"
import { resolveOwnerOrganizationIdsForQueries } from "@/src/lib/panel/resolve-owner-organization-ids"
import type { OwnerOrganizationIdList } from "@/src/types/panel-data-scope"

export type OwnerBookingsPeriod = "day" | "week" | "month"

/**
 * Lista agendamentos das barbearias do dono.
 *
 * @param organizationIds - Conjunto de lojas do dono (`OwnerOrganizationIdList`).
 * @param options.organizationId - Filtro opcional; só aplica se estiver em `organizationIds`.
 */
export async function getOwnerBookings(
  organizationIds: OwnerOrganizationIdList,
  options: {
    organizationId?: string | null
    memberId?: string | null
    period: OwnerBookingsPeriod
    date: Date
  },
) {
  const { period, date, organizationId, memberId } = options
  const shopIds = resolveOwnerOrganizationIdsForQueries(organizationIds, organizationId)
  if (shopIds.length === 0) return []

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

  return db.booking.findMany({
    where: {
      service: { organizationId: { in: shopIds } },
      ...(memberId ? { memberId } : {}),
      date: { gte: start, lte: end },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, image: true },
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
}
