import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/src/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock("@/src/lib/prisma", () => ({
  db: {
    booking: {
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { deleteBooking } from "@/src/features/bookings/_actions/delete-booking"
import { auth } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

describe("deleteBooking", () => {
  beforeEach(() => {
    vi.mocked(auth.api.getSession).mockReset()
    vi.mocked(db.booking.deleteMany).mockReset()
    vi.mocked(db.booking.findUnique).mockReset()
  })

  it("cancela apenas agendamentos do usuário autenticado", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never)
    vi.mocked(db.booking.deleteMany).mockResolvedValue({ count: 1 })

    await deleteBooking("11111111-1111-4111-8111-111111111111")

    expect(db.booking.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "user-1",
        status: "CONFIRMED",
        date: { gt: expect.any(Date) },
      },
    })
  })

  it("nega cancelamento quando o agendamento pertence a outro usuário", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never)
    vi.mocked(db.booking.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(db.booking.findUnique).mockResolvedValue({
      userId: "user-2",
    } as never)

    await expect(
      deleteBooking("11111111-1111-4111-8111-111111111111"),
    ).rejects.toThrow("Você não tem permissão para cancelar este agendamento")
  })
})
