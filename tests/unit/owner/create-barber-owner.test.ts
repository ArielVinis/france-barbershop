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
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { createBarberOwner } from "@/src/features/owner/_actions/create-barber-owner"
import { getCurrentUser } from "@/src/lib/auth"
import { requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"

describe("createBarberOwner (integração com authz)", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    vi.mocked(requireBarbershopForOwner).mockReset()
    vi.mocked(db.user.findUnique).mockReset()
    vi.mocked(db.$transaction).mockReset()
  })

  it("lança quando a barbearia não existe", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "owner-1" } as never)
    vi.mocked(requireBarbershopForOwner).mockRejectedValue(
      new Error("Barbearia não encontrada"),
    )

    await expect(
      createBarberOwner("loja-alheia", "novo@email.com"),
    ).rejects.toThrow("Barbearia não encontrada")

    expect(db.user.findUnique).not.toHaveBeenCalled()
  })
})
