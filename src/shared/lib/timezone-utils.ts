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
