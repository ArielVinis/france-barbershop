"use server"

import { revalidatePath } from "next/cache"
import { db } from "../../../lib/prisma"
import { getSession } from "@/src/lib/auth"

interface CreateBookingParams {
  serviceId: string
  barberId?: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }
  await db.booking.create({
    data: { ...params, userId: session.user.id },
  })
  revalidatePath("/barbershops/[slug]", "page")
  revalidatePath("/bookings")
}
