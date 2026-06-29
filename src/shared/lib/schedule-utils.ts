import { addMinutes } from "date-fns"

/** Horário de um dia: usado por BarbershopSchedule e BarberSchedule */
export type DaySchedule = {
  startTime: string
  endTime: string
  isActive: boolean
}

/**
 * Converte horário "HH:mm" em minutos desde meia-noite
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function minuteRangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB
}

export function getBookingMinuteRange(
  date: Date,
  durationMinutes: number,
): { startMin: number; endMin: number } {
  const startMin = date.getHours() * 60 + date.getMinutes()
  return { startMin, endMin: startMin + durationMinutes }
}

export function isBookingWithinDaySchedule(
  date: Date,
  durationMinutes: number,
  schedule: DaySchedule | null | undefined,
): boolean {
  if (!schedule?.isActive) return false

  const { startMin, endMin } = getBookingMinuteRange(date, durationMinutes)
  const scheduleStart = timeToMinutes(schedule.startTime)
  const scheduleEnd = timeToMinutes(schedule.endTime)

  return startMin >= scheduleStart && endMin <= scheduleEnd
}

export function bookingOverlapsBreak(
  date: Date,
  durationMinutes: number,
  breaks: BreakSlot[],
): boolean {
  const { startMin, endMin } = getBookingMinuteRange(date, durationMinutes)

  return breaks.some((b) =>
    minuteRangesOverlap(
      startMin,
      endMin,
      timeToMinutes(b.startTime),
      timeToMinutes(b.endTime),
    ),
  )
}

export function bookingOverlapsBlockedSlot(
  start: Date,
  durationMinutes: number,
  blockedSlot: BlockedSlot,
): boolean {
  const end = addMinutes(start, durationMinutes)
  return start < blockedSlot.endAt && end > blockedSlot.startAt
}

/**
 * Gera uma lista de horários disponíveis baseado no schedule do dia
 * @param schedule - Horário de funcionamento do dia (barbearia ou barbeiro)
 * @param intervalMinutes - Intervalo entre horários (padrão: 30 minutos)
 * @returns Array de horários no formato "HH:mm"
 */
export function generateTimeSlots(
  schedule: DaySchedule | null,
  intervalMinutes: number = 30,
): string[] {
  if (!schedule || !schedule.isActive) {
    return []
  }

  const startTime = timeToMinutes(schedule.startTime)
  const endTime = timeToMinutes(schedule.endTime)

  const timeSlots: string[] = []
  let currentTime = startTime

  while (currentTime < endTime) {
    const hours = Math.floor(currentTime / 60)
    const minutes = currentTime % 60
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    timeSlots.push(timeString)
    currentTime += intervalMinutes
  }

  return timeSlots
}

export function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/** Pausa recorrente em um dia (ex.: almoço 12:00–13:00) */
export type BreakSlot = { startTime: string; endTime: string }

/**
 * Remove horários que caem dentro de pausas do barbeiro
 */
export function filterTimesByBreaks(
  timeSlots: string[],
  breaks: BreakSlot[],
): string[] {
  if (breaks.length === 0) return timeSlots

  return timeSlots.filter((time) => {
    const slotMin = timeToMinutes(time)
    const isInsideBreak = breaks.some((b) => {
      const start = timeToMinutes(b.startTime)
      const end = timeToMinutes(b.endTime)
      return slotMin >= start && slotMin < end
    })
    return !isInsideBreak
  })
}

/** Bloqueio por período (ex.: férias) */
export type BlockedSlot = { startAt: Date; endAt: Date }

/**
 * Remove horários que caem dentro de bloqueios do barbeiro no dia selecionado
 */
export function filterTimesByBlockedSlots(
  timeSlots: string[],
  selectedDay: Date,
  blockedSlots: BlockedSlot[],
): string[] {
  if (blockedSlots.length === 0) return timeSlots

  const dayStart = new Date(selectedDay)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(selectedDay)
  dayEnd.setHours(23, 59, 59, 999)

  return timeSlots.filter((time) => {
    const [hour, minute] = time.split(":").map(Number)
    const slotDate = new Date(selectedDay)
    slotDate.setHours(hour, minute, 0, 0)

    const isBlocked = blockedSlots.some(
      (b) => slotDate >= b.startAt && slotDate < b.endAt,
    )
    return !isBlocked
  })
}

export function filterAvailableTimes(
  timeSlots: string[],
  bookings: Array<{ date: Date }>,
  selectedDay: Date,
): string[] {
  const today = new Date()
  const isToday =
    selectedDay.getDate() === today.getDate() &&
    selectedDay.getMonth() === today.getMonth() &&
    selectedDay.getFullYear() === today.getFullYear()

  return timeSlots.filter((time) => {
    const [hour, minute] = time.split(":").map(Number)
    const timeDate = new Date(selectedDay)
    timeDate.setHours(hour, minute, 0, 0)

    if (isToday && timeDate < today) {
      return false
    }

    const hasBooking = bookings.some(
      (booking) =>
        booking.date.getHours() === hour &&
        booking.date.getMinutes() === minute &&
        booking.date.getDate() === selectedDay.getDate() &&
        booking.date.getMonth() === selectedDay.getMonth() &&
        booking.date.getFullYear() === selectedDay.getFullYear(),
    )

    return !hasBooking
  })
}
