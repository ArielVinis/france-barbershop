"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { requireBarbershopForOwner } from "@/src/lib/authz"
import { PATHS } from "@/src/constants/PATHS"

const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/

export type CreateBarbershopBreakInput = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export async function createBarbershopBreakOwner(
  barbershopId: string,
  input: CreateBarbershopBreakInput,
) {
  const user = await getCurrentUser()
  const shop = await requireBarbershopForOwner(user.id, barbershopId)

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

  const created = await db.barbershopBreak.create({
    data: {
      barbershopId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
    },
  })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))

  return created
}
