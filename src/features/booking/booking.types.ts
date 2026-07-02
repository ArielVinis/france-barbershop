import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/prisma/generated/prisma/client"
import type { PanelPeriod } from "@/src/shared/types/panel-data-scope"

export type OwnerBookingsPeriod = PanelPeriod

export type ServiceDayBooking = {
  id: string
  date: Date | string
  memberId: string | null
  status: BookingStatus
}

/**
 * Forma de um agendamento listado para o dono (`getOwnerBookings` + include).
 */
export type OwnerBookingRow = {
  id: string
  userId: string
  serviceId: string
  memberId: string | null
  date: Date | string
  status: BookingStatus
  observations: string | null
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  createdAt: Date | string
  updatedAt: Date | string
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
  service: {
    id: string
    name: string
    durationMinutes: number
    price: string | number
    organizationId: string
  }
  member: {
    id: string
    user: { name: string | null }
  } | null
}

export interface UpdateBookingStatusOptions {
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
}
