"use server"

import { revalidatePath } from "next/cache"
import { db } from "../../../lib/prisma"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"

interface CreateBookingParams {
  serviceId: string
  barberId?: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }
  await db.booking.create({
    data: { ...params, userId: session.user.id },
  })
  revalidatePath("/barbershops/[slug]", "page")
  revalidatePath("/bookings")
}
