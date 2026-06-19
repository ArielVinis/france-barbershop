import { cache } from "react"
import { scheduleRepository } from "@/src/features/schedule/schedule.repository"
import type {
  BarbershopScheduleInput,
  CreateBarbershopBlockedSlotInput,
  CreateBarbershopBreakInput,
} from "@/src/features/schedule/schedule.schema"
import { ForbiddenError, NotFoundError } from "@/src/shared/errors/errors"
import { requireOrganizationForOwner } from "@/src/shared/guards"

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

export const scheduleService = {
  async upsertBarbershopSchedulesOwner(
    ownerUserId: string,
    organizationId: string,
    inputs: BarbershopScheduleInput[],
  ) {
    const shop = await requireOrganizationForOwner(ownerUserId, organizationId)

    for (const input of inputs) {
      if (input.isActive) {
        const err = validateSchedule(input)
        if (err) throw new Error(err)
      }
    }

    const existing = await scheduleRepository.findSchedulesByOrganization(
      organizationId,
    )
    const existingDays = new Set(existing.map((s) => s.dayOfWeek))

    for (const input of inputs) {
      if (input.isActive) {
        await scheduleRepository.upsertSchedule(organizationId, input)
      } else if (existingDays.has(input.dayOfWeek)) {
        await scheduleRepository.deactivateSchedule(
          organizationId,
          input.dayOfWeek,
        )
      }
    }

    return shop
  },

  async createBarbershopBreakOwner(
    ownerUserId: string,
    organizationId: string,
    input: CreateBarbershopBreakInput,
  ) {
    const shop = await requireOrganizationForOwner(ownerUserId, organizationId)

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

    const created = await scheduleRepository.createBreak({
      organizationId,
      ...input,
    })

    return { shop, created }
  },

  async deleteBarbershopBreakOwner(ownerUserId: string, breakId: string) {
    const row = await scheduleRepository.findBreakById(breakId)
    if (!row) throw new NotFoundError("Pausa não encontrada")

    const shop = await requireOrganizationForOwner(
      ownerUserId,
      row.organizationId,
    ).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a esta pausa")
      }
      throw error
    })

    await scheduleRepository.deleteBreak(breakId)
    return shop
  },

  async createBarbershopBlockedSlotOwner(
    ownerUserId: string,
    organizationId: string,
    input: CreateBarbershopBlockedSlotInput,
  ) {
    const shop = await requireOrganizationForOwner(ownerUserId, organizationId)

    if (input.startAt >= input.endAt) {
      throw new Error("Data de fim deve ser após o início")
    }

    const created = await scheduleRepository.createBlockedSlot({
      organizationId,
      ...input,
    })

    return { shop, created }
  },

  async deleteBarbershopBlockedSlotOwner(ownerUserId: string, slotId: string) {
    const row = await scheduleRepository.findBlockedSlotById(slotId)
    if (!row) throw new NotFoundError("Bloqueio não encontrado")

    const shop = await requireOrganizationForOwner(
      ownerUserId,
      row.organizationId,
    ).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a este bloqueio")
      }
      throw error
    })

    await scheduleRepository.deleteBlockedSlot(slotId)
    return shop
  },

  getOwnerOrganizationHours: cache(
    async (userId: string, organizationId: string) => {
      await requireOrganizationForOwner(userId, organizationId)
      return scheduleRepository.findOrganizationHours(organizationId)
    },
  ),
}
