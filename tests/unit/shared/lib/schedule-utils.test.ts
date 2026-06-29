import { describe, it, expect } from "vitest"
import {
  bookingOverlapsBlockedSlot,
  bookingOverlapsBreak,
  isBookingWithinDaySchedule,
  minuteRangesOverlap,
} from "@/src/shared/lib/schedule-utils"

describe("minuteRangesOverlap", () => {
  it("detecta sobreposição parcial", () => {
    expect(minuteRangesOverlap(600, 660, 630, 690)).toBe(true)
  })

  it("não detecta quando os intervalos são adjacentes", () => {
    expect(minuteRangesOverlap(600, 660, 660, 720)).toBe(false)
  })
})

describe("isBookingWithinDaySchedule", () => {
  const schedule = {
    startTime: "09:00",
    endTime: "18:00",
    isActive: true,
  }

  it("aceita agendamento inteiro dentro do horário", () => {
    const date = new Date("2026-06-14T10:00:00")
    expect(isBookingWithinDaySchedule(date, 30, schedule)).toBe(true)
  })

  it("rejeita quando a duração ultrapassa o fim do expediente", () => {
    const date = new Date("2026-06-14T17:45:00")
    expect(isBookingWithinDaySchedule(date, 30, schedule)).toBe(false)
  })

  it("rejeita dia inativo ou sem horário", () => {
    const date = new Date("2026-06-14T10:00:00")
    expect(isBookingWithinDaySchedule(date, 30, null)).toBe(false)
    expect(
      isBookingWithinDaySchedule(date, 30, { ...schedule, isActive: false }),
    ).toBe(false)
  })
})

describe("bookingOverlapsBreak", () => {
  it("detecta conflito quando o intervalo cruza a pausa", () => {
    const date = new Date("2026-06-14T11:45:00")
    const breaks = [{ startTime: "12:00", endTime: "13:00" }]

    expect(bookingOverlapsBreak(date, 30, breaks)).toBe(true)
  })

  it("não detecta conflito quando termina antes da pausa", () => {
    const date = new Date("2026-06-14T11:30:00")
    const breaks = [{ startTime: "12:00", endTime: "13:00" }]

    expect(bookingOverlapsBreak(date, 30, breaks)).toBe(false)
  })
})

describe("bookingOverlapsBlockedSlot", () => {
  it("detecta sobreposição com bloqueio por período", () => {
    const start = new Date("2026-06-14T10:00:00")
    const blockedSlot = {
      startAt: new Date("2026-06-14T09:00:00"),
      endAt: new Date("2026-06-14T11:00:00"),
    }

    expect(bookingOverlapsBlockedSlot(start, 30, blockedSlot)).toBe(true)
  })

  it("não detecta conflito fora do bloqueio", () => {
    const start = new Date("2026-06-14T14:00:00")
    const blockedSlot = {
      startAt: new Date("2026-06-14T09:00:00"),
      endAt: new Date("2026-06-14T11:00:00"),
    }

    expect(bookingOverlapsBlockedSlot(start, 30, blockedSlot)).toBe(false)
  })
})
