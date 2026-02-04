/** Horário de um dia: usado por BarbershopSchedule e BarberSchedule */
export type DaySchedule = {
  startTime: string
  endTime: string
  isActive: boolean
}

/**
 * Converte horário "HH:mm" em minutos desde meia-noite
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
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
