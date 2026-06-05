import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/src/server/auth/users", () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("@/src/lib/authz/require-organization-for-owner", () => ({
  requireOrganizationForOwner: vi.fn(),
}))

vi.mock("@/src/lib/prisma", () => ({
  db: {
    organizationService: {
      create: vi.fn(),
    },
  },
}))

import { createServiceOwner } from "@/src/features/owner/_actions/create-service-owner"
import { getCurrentUser } from "@/src/server/auth/users"
import { requireOrganizationForOwner } from "@/src/lib/authz/require-organization-for-owner"
import { db } from "@/src/lib/prisma"

const validInput = {
  organizationId: "shop-1",
  name: "Corte",
  description: "Desc",
  imageUrl: "",
  price: 30,
  durationMinutes: 30,
}

describe("createServiceOwner (integração com authz)", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    vi.mocked(requireOrganizationForOwner).mockReset()
    vi.mocked(db.organizationService.create).mockReset()
  })

  it("lança quando a barbearia não existe ou o utilizador não tem acesso", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      user: { id: "u1", role: "OWNER" },
    } as never)
    vi.mocked(requireOrganizationForOwner).mockRejectedValue(
      new Error("Barbearia não encontrada"),
    )

    await expect(createServiceOwner(validInput)).rejects.toThrow(
      "Barbearia não encontrada",
    )
    expect(db.organizationService.create).not.toHaveBeenCalled()
  })

  it("cria serviço quando a posse autoriza", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      user: { id: "u1", role: "OWNER" },
    } as never)
    vi.mocked(requireOrganizationForOwner).mockResolvedValue({
      id: "shop-1",
      slug: "shop-1",
    })
    vi.mocked(db.organizationService.create).mockResolvedValue({
      id: "svc-new",
    } as never)

    const result = await createServiceOwner(validInput)

    expect(result).toEqual({ id: "svc-new" })
    expect(db.organizationService.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "shop-1",
        name: "Corte",
        price: 30,
        durationMinutes: 30,
      }),
      select: { id: true },
    })
  })
})
