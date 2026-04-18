import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/src/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("@/src/lib/authz", () => ({
  resolvePanelContext: vi.fn(),
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
import { resolvePanelContext } from "@/src/lib/authz"
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
    vi.mocked(resolvePanelContext).mockReset()
    vi.mocked(db.barbershopService.create).mockReset()
  })

  it("lança quando resolvePanelContext não devolve OWNER", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "OWNER",
    } as never)
    vi.mocked(resolvePanelContext).mockResolvedValue(null)

    await expect(createServiceOwner(validInput)).rejects.toThrow(
      "Barbearia não encontrada ou você não é o dono",
    )
    expect(db.barbershopService.create).not.toHaveBeenCalled()
  })

  it("cria serviço quando o contexto é OWNER escopado à loja", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "OWNER",
    } as never)
    vi.mocked(resolvePanelContext).mockResolvedValue({
      role: "OWNER",
      userId: "u1",
      barbershopId: "shop-1",
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
