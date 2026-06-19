import type { Organization } from "@/prisma/generated/prisma/client"

export type BarbershopListItem = Pick<
  Organization,
  "id" | "name" | "slug" | "logo" | "address"
>

export type PublicBarberForBooking = {
  id: string
  user: { name: string }
  schedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }>
  breaks: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
  blockedSlots: Array<{ startAt: Date; endAt: Date }>
}

export interface GetBarbershopsProps {
  searchParams: Promise<{
    title?: string
    service?: string
  }>
}
