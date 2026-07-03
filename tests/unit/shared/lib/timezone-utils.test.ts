import { describe, it, expect } from "vitest"
import {
  buildAppZonedDateTime,
  getZonedDayBounds,
  getZonedDayOfWeek,
  getZonedMinutesSinceMidnight,
} from "@/src/shared/lib/timezone-utils"
import { isBookingWithinDaySchedule } from "@/src/shared/lib/schedule-utils"

describe("timezone-utils", () => {
  it("interpreta horário em America/Sao_Paulo independentemente do fuso do servidor", () => {
    const date = new Date("2026-07-04T14:00:00.000Z")

    expect(getZonedMinutesSinceMidnight(date)).toBe(11 * 60)
    expect(getZonedDayOfWeek(date)).toBe(6)
  })

  it("calcula limites do dia em UTC para consultas no banco", () => {
    const date = new Date("2026-07-04T14:00:00.000Z")
    const { start, end } = getZonedDayBounds(date)

    expect(start.toISOString()).toBe("2026-07-04T03:00:00.000Z")
    expect(end.toISOString()).toBe("2026-07-05T02:59:59.999Z")
  })

  it("monta instante UTC a partir de dia + horário local da barbearia", () => {
    const day = new Date("2026-07-04T12:00:00.000Z")
    const slot = buildAppZonedDateTime(day, "11:00")

    expect(slot.toISOString()).toBe("2026-07-04T14:00:00.000Z")
  })
})

describe("isBookingWithinDaySchedule (timezone)", () => {
  const schedule = {
    startTime: "09:00",
    endTime: "20:00",
    isActive: true,
  }

  it("aceita 11:00 em São Paulo quando o instante está em UTC", () => {
    const date = new Date("2026-07-04T14:00:00.000Z")

    expect(isBookingWithinDaySchedule(date, 30, schedule)).toBe(true)
  })

  it("rejeita quando a duração ultrapassa o fim do expediente em São Paulo", () => {
    const date = new Date("2026-07-04T22:01:00.000Z")

    expect(isBookingWithinDaySchedule(date, 60, schedule)).toBe(false)
  })
})
