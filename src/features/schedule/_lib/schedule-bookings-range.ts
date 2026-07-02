import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import type { OwnerBookingsPeriod } from "@/src/features/booking/booking.types"

export function periodBounds(period: OwnerBookingsPeriod, date: Date) {
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

export function mergeScheduleFetchBounds(
  tablePeriod: OwnerBookingsPeriod,
  tableDate: Date,
  calendarDate: Date,
) {
  const table = periodBounds(tablePeriod, tableDate)
  const calendar = periodBounds("month", calendarDate)
  return {
    start: table.start < calendar.start ? table.start : calendar.start,
    end: table.end > calendar.end ? table.end : calendar.end,
  }
}

export function filterBookingsByPeriod<T extends { date: Date }>(
  bookings: T[],
  period: OwnerBookingsPeriod,
  date: Date,
): T[] {
  const { start, end } = periodBounds(period, date)
  return bookings.filter((b) => b.date >= start && b.date <= end)
}
