import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { getBarbershopsForUser } from "@/src/lib/authz/get-barbershops-for-user"
import { db } from "@/src/lib/prisma"

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}))

vi.mock("@/src/lib/prisma", () => ({
  db: {
    barbershop: {
      findFirst: vi.fn(),
    },
  },
}))

const findFirst = db.barbershop.findFirst as Mock

describe("getBarbershopsForUser", () => {
  beforeEach(() => {
    findFirst.mockReset()
  })

  it("passa id e dono ao Prisma", async () => {
    findFirst.mockResolvedValue({ id: "shop-1", slug: "foo" })

    const result = await getBarbershopsForUser("user-1", "shop-1")

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "shop-1",
        owners: { some: { id: "user-1" } },
      },
      select: { id: true, slug: true },
    })
    expect(result).toEqual({ id: "shop-1", slug: "foo" })
  })

  it("devolve null quando a loja não existe ou o utilizador não é dono", async () => {
    findFirst.mockResolvedValue(null)

    const result = await getBarbershopsForUser("user-1", "outra-loja")

    expect(result).toBeNull()
  })
})
