import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { Role } from "@/prisma/generated/prisma/enums"
import { getOrganizationForOwner } from "@/src/shared/guards/get-organizations-for-owner"
import { db } from "@/src/shared/lib/prisma"

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}))

vi.mock("@/src/shared/lib/prisma", () => ({
  db: {
    organization: {
      findFirst: vi.fn(),
    },
  },
}))

const findFirst = db.organization.findFirst as Mock

describe("getOrganizationForOwner", () => {
  beforeEach(() => {
    findFirst.mockReset()
  })

  it("passa id e dono ao Prisma", async () => {
    findFirst.mockResolvedValue({
      id: "org-1",
      slug: "foo",
    })

    const result = await getOrganizationForOwner("user-1", "org-1")

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "org-1",
        members: {
          some: {
            userId: "user-1",
            role: Role.OWNER,
          },
        },
      },
      select: {
        id: true,
        slug: true,
      },
    })
    expect(result).toEqual({ id: "org-1", slug: "foo" })
  })

  it("devolve null quando a loja não existe ou o utilizador não é dono", async () => {
    findFirst.mockResolvedValue(null)

    const result = await getOrganizationForOwner("user-1", "outra-loja")

    expect(result).toBeNull()
  })
})
