/**
 * Forma mínima dos dados de agenda do barbeiro (painel do dono).
 */
export type OwnerScheduleDayRow = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export type OwnerBarberBreakRow = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type OwnerBarberBlockedSlotRow = {
  id: string
  startAt: Date
  endAt: Date
  reason: string | null
}

export type BarberForOwner = {
  user: { name: string | null; email: string | null }
  organization: {
    id: string
    name: string
    slug: string
    schedules: OwnerScheduleDayRow[]
  }
  schedules: OwnerScheduleDayRow[]
  breaks: OwnerBarberBreakRow[]
  blockedSlots: OwnerBarberBlockedSlotRow[]
}
