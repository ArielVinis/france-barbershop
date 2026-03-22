"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { getBarbershopForOwner } from "@/src/app/(authenticated)/owner/_features/_data/assert-owner-barbershop"

export type BarbershopScheduleInput = {
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

function validateSchedule(input: BarbershopScheduleInput): string | null {
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

export async function upsertBarbershopSchedulesOwner(
  barbershopId: string,
  inputs: BarbershopScheduleInput[],
) {
  const user = await getCurrentUser()
  const shop = await getBarbershopForOwner(user.id, barbershopId)
  if (!shop) throw new Error("Barbearia não encontrada ou você não é o dono")

  for (const input of inputs) {
    if (input.isActive) {
      const err = validateSchedule(input)
      if (err) throw new Error(err)
    }
  }

  const existing = await db.barbershopSchedule.findMany({
    where: { barbershopId },
    select: { dayOfWeek: true },
  })
  const existingDays = new Set(existing.map((s) => s.dayOfWeek))

  for (const input of inputs) {
    if (input.isActive) {
      await db.barbershopSchedule.upsert({
        where: {
          barbershopId_dayOfWeek: { barbershopId, dayOfWeek: input.dayOfWeek },
        },
        create: {
          barbershopId,
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
      await db.barbershopSchedule.update({
        where: {
          barbershopId_dayOfWeek: { barbershopId, dayOfWeek: input.dayOfWeek },
        },
        data: { isActive: false },
      })
    }
  }

  revalidatePath("/owner/horarios")
  revalidatePath(`/${shop.slug}`)
}
