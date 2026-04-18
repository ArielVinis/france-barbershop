import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/src/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("@/src/lib/authz", () => ({
  getBarbershopForOwner: vi.fn(),
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
import { getBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"

describe("createBarberOwner (integração com getBarbershopForOwner)", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    vi.mocked(getBarbershopForOwner).mockReset()
    vi.mocked(db.user.findUnique).mockReset()
    vi.mocked(db.$transaction).mockReset()
  })

  it("lança quando getBarbershopForOwner devolve null", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "owner-1" } as never)
    vi.mocked(getBarbershopForOwner).mockResolvedValue(null)

    await expect(
      createBarberOwner("loja-alheia", "novo@email.com"),
    ).rejects.toThrow("Barbearia não encontrada ou você não é o dono")

    expect(db.user.findUnique).not.toHaveBeenCalled()
  })
})
