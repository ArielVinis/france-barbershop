import { endOfDay, set, startOfDay } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { APP_TIMEZONE } from "@/src/shared/constants/timezone"

export type ZonedDateParts = {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  dayOfWeek: number
}

export function toAppZonedTime(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): Date {
  return toZonedTime(date, timeZone)
}

export function getZonedDateParts(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): ZonedDateParts {
  const zoned = toZonedTime(date, timeZone)

  return {
    year: zoned.getFullYear(),
    month: zoned.getMonth(),
    day: zoned.getDate(),
    hours: zoned.getHours(),
    minutes: zoned.getMinutes(),
    dayOfWeek: zoned.getDay(),
  }
}

export function getZonedDayOfWeek(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): number {
  return getZonedDateParts(date, timeZone).dayOfWeek
}

export function getZonedMinutesSinceMidnight(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): number {
  const { hours, minutes } = getZonedDateParts(date, timeZone)
  return hours * 60 + minutes
}

export function getZonedDayBounds(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): { start: Date; end: Date } {
  const zoned = toZonedTime(date, timeZone)

  return {
    start: fromZonedTime(startOfDay(zoned), timeZone),
    end: fromZonedTime(endOfDay(zoned), timeZone),
  }
}

export function isSameAppZonedDay(
  left: Date,
  right: Date,
  timeZone: string = APP_TIMEZONE,
): boolean {
  const leftParts = getZonedDateParts(left, timeZone)
  const rightParts = getZonedDateParts(right, timeZone)

  return (
    leftParts.year === rightParts.year &&
    leftParts.month === rightParts.month &&
    leftParts.day === rightParts.day
  )
}

export function buildAppZonedDateTime(
  day: Date,
  time: string,
  timeZone: string = APP_TIMEZONE,
): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const zonedDay = toZonedTime(day, timeZone)
  const zonedSlot = set(zonedDay, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  })

  return fromZonedTime(zonedSlot, timeZone)
}

/**
 * Converte `yyyy-MM-dd` (query string) em instante UTC do meio-dia nesse dia
 * no fuso da app. Evita o parse ISO (`new Date("2026-07-02")`) que trata
 * a data como UTC e pode exibir o dia anterior em fusos negativos.
 */
export function parseAppZonedDateParam(
  value: string,
  timeZone: string = APP_TIMEZONE,
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  // Meio-dia evita mudança de dia por DST ao converter entre fusos.
  const wallClock = new Date(year, month - 1, day, 12, 0, 0, 0)
  if (
    wallClock.getFullYear() !== year ||
    wallClock.getMonth() !== month - 1 ||
    wallClock.getDate() !== day
  ) {
    return null
  }

  return fromZonedTime(wallClock, timeZone)
}

/** Formata um instante como `yyyy-MM-dd` no fuso da app (para query strings). */
export function formatAppZonedDateParam(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): string {
  const { year, month, day } = getZonedDateParts(date, timeZone)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${year}-${pad(month + 1)}-${pad(day)}`
}
