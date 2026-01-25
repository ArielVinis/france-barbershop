import { BarbershopSchedule } from "@prisma/client"

/**
 * Gera uma lista de horários disponíveis baseado no schedule da barbearia
 * @param schedule - Horário de funcionamento do dia
 * @param intervalMinutes - Intervalo entre horários (padrão: 30 minutos)
 * @returns Array de horários no formato "HH:mm"
 */
export function generateTimeSlots(
  schedule: BarbershopSchedule | null,
  intervalMinutes: number = 30,
): string[] {
  if (!schedule || !schedule.isActive) {
    return []
  }

  const [startHour, startMinute] = schedule.startTime.split(":").map(Number)
  const [endHour, endMinute] = schedule.endTime.split(":").map(Number)

  const startTime = startHour * 60 + startMinute // minutos desde meia-noite
  const endTime = endHour * 60 + endMinute // minutos desde meia-noite

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

    // Filtrar horários passados (apenas se for hoje)
    if (isToday && timeDate < today) {
      return false
    }

    // Filtrar horários já ocupados
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
