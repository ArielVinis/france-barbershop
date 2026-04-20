import { describe, it, expect, vi, beforeEach, Mock } from "vitest"

vi.mock("react", async (importOriginal) => {
  const React = await importOriginal<typeof import("react")>()
  return {
    ...React,
    cache: <T extends (..._args: never[]) => unknown>(fn: T) => fn,
  }
})

vi.mock("@/src/lib/prisma", () => ({
  db: {
    barber: {
      findUnique: vi.fn(),
    },
  },
}))

import { getBarberForUser } from "@/src/lib/authz/get-barber-for-user"
import { db } from "@/src/lib/prisma"

const findUnique = db.barber.findUnique as Mock

describe("getBarberForUser", () => {
  beforeEach(() => {
    findUnique.mockReset()
  })

  it("resolve barberId e barbershopId pelo userId", async () => {
    findUnique.mockResolvedValue({ id: "barber-1", barbershopId: "shop-1" })

    const result = await getBarberForUser("user-99")

    expect(findUnique).toHaveBeenCalledWith({
      where: { userId: "user-99" },
      select: { id: true, barbershopId: true },
    })
    expect(result).toEqual({ id: "barber-1", barbershopId: "shop-1" })
  })

  it("devolve null quando não existe registo Barber", async () => {
    findUnique.mockResolvedValue(null)

    const result = await getBarberForUser("user-sem-barber")

    expect(result).toBeNull()
  })
})
