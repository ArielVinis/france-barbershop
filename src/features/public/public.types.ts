export type BarbershopListItem = {
  id: string
  name: string
  slug: string
  logo: string | null
  address: string
}

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
  blockedSlots: Array<{ startAt: string; endAt: string }>
}

export type PublicServiceForBooking = {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
  durationMinutes: number
  organizationId: string
}

export type PublicOrganizationForBooking = {
  name: string
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
  blockedSlots: Array<{ startAt: string; endAt: string }>
}

export type PublicBarbershopOrganization = {
  id: string
  name: string
  slug: string
  logo: string | null
  address: string
  phones: string[]
  description: string
  services: PublicServiceForBooking[]
  schedules: PublicOrganizationForBooking["schedules"]
  breaks: PublicOrganizationForBooking["breaks"]
  blockedSlots: PublicOrganizationForBooking["blockedSlots"]
}

export type PublicBarbershopPageData = {
  organization: PublicBarbershopOrganization
  barbers: PublicBarberForBooking[]
}

export interface GetBarbershopsProps {
  searchParams: Promise<{
    title?: string
    service?: string
  }>
}
