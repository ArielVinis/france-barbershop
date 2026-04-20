import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/src/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("@/src/lib/authz", () => ({
  requireBarbershopForOwner: vi.fn(),
}))

vi.mock("@/src/lib/prisma", () => ({
  db: {
    barbershopService: {
      create: vi.fn(),
    },
  },
}))

import { createServiceOwner } from "@/src/features/owner/_actions/create-service-owner"
import { getCurrentUser } from "@/src/lib/auth"
import { requireBarbershopForOwner } from "@/src/lib/authz"
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
    vi.mocked(requireBarbershopForOwner).mockReset()
    vi.mocked(db.barbershopService.create).mockReset()
  })

  it("lança quando a barbearia não existe", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "OWNER",
    } as never)
    vi.mocked(requireBarbershopForOwner).mockRejectedValue(
      new Error("Barbearia não encontrada"),
    )

    await expect(createServiceOwner(validInput)).rejects.toThrow(
      "Barbearia não encontrada",
    )
    expect(db.barbershopService.create).not.toHaveBeenCalled()
  })

  it("cria serviço quando a loja é autorizada via helper", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "OWNER",
    } as never)
    vi.mocked(requireBarbershopForOwner).mockResolvedValue({
      id: "shop-1",
      slug: "shop-1",
    })

    await createServiceOwner(validInput)

    expect(db.barbershopService.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        barbershopId: "shop-1",
        name: "Corte",
        price: 30,
        durationMinutes: 30,
      }),
    })
  })
})
