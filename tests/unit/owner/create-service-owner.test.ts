import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/src/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("@/src/auth", () => ({
  can: vi.fn(),
  toAppRole: vi.fn((r: string) => r),
}))

vi.mock("@/src/lib/authz/require-barbershop-for-owner", () => ({
  requireBarbershopForOwner: vi.fn(),
}))

vi.mock("@/src/lib/prisma", () => ({
  db: {
    barbershopService: {
      create: vi.fn(),
    },
  },
}))

import { can, toAppRole, type AppRole } from "@/src/auth"
import { createServiceOwner } from "@/src/features/owner/_actions/create-service-owner"
import { getCurrentUser } from "@/src/lib/auth"
import { requireBarbershopForOwner } from "@/src/lib/authz/require-barbershop-for-owner"
import { db } from "@/src/lib/prisma"

const validInput = {
  barbershopId: "shop-1",
  name: "Corte",
  description: "Desc",
  imageUrl: "",
  price: 30,
  durationMinutes: 30,
}

describe("createServiceOwner (integração com authz)", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    vi.mocked(can).mockReset()
    vi.mocked(toAppRole).mockImplementation(
      (value) => (value ?? "CLIENT") as AppRole,
    )
    vi.mocked(requireBarbershopForOwner).mockReset()
    vi.mocked(db.barbershopService.create).mockReset()
  })

  it("lança quando a barbearia não existe ou o utilizador não tem acesso", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "OWNER",
    } as never)
    vi.mocked(can).mockReturnValue(true)
    vi.mocked(requireBarbershopForOwner).mockRejectedValue(
      new Error("Barbearia não encontrada"),
    )

    await expect(createServiceOwner(validInput)).rejects.toThrow(
      "Barbearia não encontrada",
    )
    expect(db.barbershopService.create).not.toHaveBeenCalled()
  })

  it("cria serviço quando a política e a posse autorizam", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "OWNER",
    } as never)
    vi.mocked(can).mockReturnValue(true)
    vi.mocked(requireBarbershopForOwner).mockResolvedValue({
      id: "shop-1",
      slug: "shop-1",
    })
    vi.mocked(db.barbershopService.create).mockResolvedValue({
      id: "svc-new",
    } as never)

    const result = await createServiceOwner(validInput)

    expect(result).toEqual({ id: "svc-new" })
    expect(db.barbershopService.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        barbershopId: "shop-1",
        name: "Corte",
        price: 30,
        durationMinutes: 30,
      }),
      select: { id: true },
    })
  })
})
