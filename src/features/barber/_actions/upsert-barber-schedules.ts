"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export type BarberScheduleInput = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = time.match(TIME_REGEX)
  if (!match) return null
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

function validateSchedule(input: BarberScheduleInput): string | null {
  if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
    return "Dia da semana inválido (0-6)"
  }
  const start = parseTime(input.startTime)
  const end = parseTime(input.endTime)
  if (!start) return "Horário de início inválido (use HH:mm)"
  if (!end) return "Horário de fim inválido (use HH:mm)"
  const startMin = start.hour * 60 + start.minute
  const endMin = end.hour * 60 + end.minute
  if (startMin >= endMin) return "Horário de fim deve ser após o início"
  return null
}

export async function upsertBarberSchedules(inputs: BarberScheduleInput[]) {
  const { id: barberId } = await getSession()

  for (const input of inputs) {
    if (input.isActive) {
      const err = validateSchedule(input)
      if (err) throw new Error(err)
    }
  }

  const existing = await db.barberSchedule.findMany({
    where: { barberId },
    select: { dayOfWeek: true },
  })
  const existingDays = new Set(existing.map((s) => s.dayOfWeek))

  for (const input of inputs) {
    if (input.isActive) {
      await db.barberSchedule.upsert({
        where: {
          barberId_dayOfWeek: { barberId, dayOfWeek: input.dayOfWeek },
        },
        create: {
          barberId,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          isActive: true,
        },
        update: {
          startTime: input.startTime,
          endTime: input.endTime,
          isActive: true,
        },
      })
    } else if (existingDays.has(input.dayOfWeek)) {
      await db.barberSchedule.update({
        where: {
          barberId_dayOfWeek: { barberId, dayOfWeek: input.dayOfWeek },
        },
        data: { isActive: false },
      })
    }
  }

  revalidatePath("/barber/settings")
  revalidatePath("/barber")
  revalidatePath("/barber/bookings")
}
