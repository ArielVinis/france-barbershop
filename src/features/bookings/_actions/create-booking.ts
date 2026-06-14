"use server"

import { revalidatePath } from "next/cache"
import { Role } from "@/prisma/generated/prisma/enums"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/src/lib/auth"
import { assertNoBarberBookingConflict } from "@/src/lib/booking-conflict"
import { db } from "@/src/lib/prisma"

const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  memberId: z.string().uuid(),
  date: z.coerce.date(),
})

export const createBooking = async (
  input: z.infer<typeof CreateBookingSchema>,
) => {
  const parsed = CreateBookingSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const { serviceId, memberId, date } = parsed.data

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  await db.$transaction(async (tx) => {
    const service = await tx.organizationService.findUnique({
      where: { id: serviceId },
      select: { organizationId: true, durationMinutes: true },
    })
    if (!service) {
      throw new Error("Serviço não encontrado")
    }

    const barberMember = await tx.member.findFirst({
      where: {
        id: memberId,
        organizationId: service.organizationId,
        role: Role.MEMBER,
        isActive: true,
      },
    })
    if (!barberMember) {
      throw new Error("Barbeiro inválido para este serviço")
    }

    await assertNoBarberBookingConflict(
      tx,
      memberId,
      date,
      service.durationMinutes,
    )

    await tx.booking.create({
      data: {
        serviceId,
        memberId,
        date,
        userId: session.user.id,
      },
    })
  })

  revalidatePath("/barbershops/[slug]", "page")
  revalidatePath("/bookings")
}
