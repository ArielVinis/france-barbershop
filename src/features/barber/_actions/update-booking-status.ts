"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { BookingStatus } from "@prisma/client"

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | { id?: string; role?: string; barberId?: string | null }
    | undefined
  if (!user?.id || user.role !== "BARBER" || !user.barberId) {
    throw new Error("Não autorizado")
  }

  const booking = await db.booking.findFirst({
    where: { id: bookingId, barberId: user.barberId },
  })
  if (!booking) {
    throw new Error("Agendamento não encontrado")
  }

  const allowed: Record<BookingStatus, BookingStatus[]> = {
    CONFIRMED: ["IN_PROGRESS"],
    IN_PROGRESS: ["FINISHED"],
    FINISHED: [],
    CANCELLED: [],
    NO_SHOW: [],
  }
  const next = allowed[booking.status]
  if (!next?.includes(status)) {
    throw new Error(
      `Não é possível alterar de ${booking.status} para ${status}`,
    )
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { status },
  })

  revalidatePath("/barber/bookings")
  revalidatePath("/barber")
}
