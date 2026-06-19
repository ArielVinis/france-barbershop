import { db } from "@/src/shared/lib/prisma"

export const scheduleRepository = {
  findSchedulesByOrganization(organizationId: string) {
    return db.organizationSchedule.findMany({
      where: { organizationId },
      select: { dayOfWeek: true },
    })
  },

  upsertSchedule(
    organizationId: string,
    input: {
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    },
  ) {
    return db.organizationSchedule.upsert({
      where: {
        organizationId_dayOfWeek: {
          organizationId,
          dayOfWeek: input.dayOfWeek,
        },
      },
      create: {
        organizationId,
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
  },

  deactivateSchedule(organizationId: string, dayOfWeek: number) {
    return db.organizationSchedule.update({
      where: {
        organizationId_dayOfWeek: { organizationId, dayOfWeek },
      },
      data: { isActive: false },
    })
  },

  createBreak(data: {
    organizationId: string
    dayOfWeek: number
    startTime: string
    endTime: string
  }) {
    return db.organizationBreak.create({ data })
  },

  findBreakById(breakId: string) {
    return db.organizationBreak.findUnique({
      where: { id: breakId },
      select: { organizationId: true },
    })
  },

  deleteBreak(breakId: string) {
    return db.organizationBreak.delete({ where: { id: breakId } })
  },

  createBlockedSlot(data: {
    organizationId: string
    startAt: Date
    endAt: Date
    reason: string | null
  }) {
    return db.organizationBlockedSlot.create({ data })
  },

  findBlockedSlotById(slotId: string) {
    return db.organizationBlockedSlot.findUnique({
      where: { id: slotId },
      select: { organizationId: true },
    })
  },

  deleteBlockedSlot(slotId: string) {
    return db.organizationBlockedSlot.delete({ where: { id: slotId } })
  },

  findOrganizationHours(organizationId: string) {
    return db.organization.findUnique({
      where: { id: organizationId },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        breaks: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        blockedSlots: { orderBy: { startAt: "asc" } },
      },
    })
  },
}
