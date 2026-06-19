import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { Role } from "@/prisma/generated/prisma/enums"
import { getBarberMemberForUser } from "@/src/shared/guards/get-barber-member-for-user"
import { db } from "@/src/shared/lib/prisma"

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}))

vi.mock("@/src/shared/lib/prisma", () => ({
  db: {
    member: {
      findFirst: vi.fn(),
    },
  },
}))

const findFirst = db.member.findFirst as Mock

describe("getBarberMemberForUser", () => {
  beforeEach(() => {
    findFirst.mockReset()
  })

  it("consulta member com role MEMBER", async () => {
    findFirst.mockResolvedValue({
      id: "m-1",
      organizationId: "org-1",
    })

    const result = await getBarberMemberForUser("user-1")

    expect(findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", role: Role.MEMBER },
      select: { id: true, organizationId: true },
    })
    expect(result).toEqual({ id: "m-1", organizationId: "org-1" })
  })
})
