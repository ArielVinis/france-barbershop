import { describe, it, expect } from "vitest"
import {
  bookingsOverlap,
  findOverlappingBooking,
} from "@/src/lib/booking-conflict"

describe("bookingsOverlap", () => {
  it("detecta sobreposição quando um intervalo começa antes do outro terminar", () => {
    const startA = new Date("2026-06-14T10:00:00")
    const startB = new Date("2026-06-14T10:15:00")

    expect(bookingsOverlap(startA, 30, startB, 30)).toBe(true)
  })

  it("não detecta conflito quando os horários são adjacentes", () => {
    const startA = new Date("2026-06-14T10:00:00")
    const startB = new Date("2026-06-14T10:30:00")

    expect(bookingsOverlap(startA, 30, startB, 30)).toBe(false)
  })

  it("não detecta conflito quando os horários são distintos", () => {
    const startA = new Date("2026-06-14T09:00:00")
    const startB = new Date("2026-06-14T11:00:00")

    expect(bookingsOverlap(startA, 30, startB, 30)).toBe(false)
  })
})

describe("findOverlappingBooking", () => {
  it("retorna o agendamento conflitante", () => {
    const candidateStart = new Date("2026-06-14T10:00:00")
    const existing = [
      {
        date: new Date("2026-06-14T10:15:00"),
        service: { durationMinutes: 30 },
      },
    ]

    expect(findOverlappingBooking(candidateStart, 30, existing)?.date).toEqual(
      existing[0].date,
    )
  })
})
