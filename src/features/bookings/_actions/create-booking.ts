"use server"

import { revalidatePath } from "next/cache"
import { db } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"

interface CreateBookingParams {
  serviceId: string
  barberId?: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Usuário não autenticado")
  }
  await db.booking.create({
    data: { ...params, userId: (session.user as any).id },
  })
  revalidatePath("/barbershops/[slug]", "page")
  revalidatePath("/bookings")
}
