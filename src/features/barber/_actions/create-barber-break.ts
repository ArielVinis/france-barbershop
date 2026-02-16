"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/

export type CreateBarberBreakInput = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export async function createBarberBreak(input: CreateBarberBreakInput) {
  const { id: barberId } = await getSession()

  if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
    throw new Error("Dia da semana inválido (0-6)")
  }
  if (!TIME_REGEX.test(input.startTime) || !TIME_REGEX.test(input.endTime)) {
    throw new Error("Horários devem estar no formato HH:mm")
  }
  const [sh, sm] = input.startTime.split(":").map(Number)
  const [eh, em] = input.endTime.split(":").map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  if (startMin >= endMin) {
    throw new Error("Horário de fim da pausa deve ser após o início")
  }

  const created = await db.barberBreak.create({
    data: {
      barberId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
    },
  })

  revalidatePath("/barber/settings")
  revalidatePath("/barber")
  revalidatePath("/barber/bookings")

  return created
}
