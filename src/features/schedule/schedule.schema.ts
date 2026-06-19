export type BarbershopScheduleInput = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export type CreateBarbershopBreakInput = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type CreateBarbershopBlockedSlotInput = {
  startAt: Date
  endAt: Date
  reason: string | null
}
