import { CreatePanelBookingSchema } from "@/src/features/booking/booking.schema"
import { describe, expect, it } from "vitest"

const base = {
  serviceId: "11111111-1111-1111-1111-111111111111",
  memberId: "22222222-2222-2222-2222-222222222222",
  date: new Date("2026-10-26T14:00:00Z"),
}

describe("CreatePanelBookingSchema", () => {
  it("aceita cliente existente", () => {
    const parsed = CreatePanelBookingSchema.safeParse({
      ...base,
      clientUserId: "33333333-3333-3333-3333-333333333333",
    })
    expect(parsed.success).toBe(true)
  })

  it("aceita walk-in com nome e telefone", () => {
    const parsed = CreatePanelBookingSchema.safeParse({
      ...base,
      walkInName: "João",
      walkInPhone: "11999998888",
    })
    expect(parsed.success).toBe(true)
  })

  it("rejeita sem cliente nem walk-in", () => {
    const parsed = CreatePanelBookingSchema.safeParse(base)
    expect(parsed.success).toBe(false)
  })
})
