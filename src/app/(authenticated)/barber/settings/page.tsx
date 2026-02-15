import { getBarberSession } from "@/src/lib/auth"
import { getBarberByUserId } from "@/src/features/barber/_data/get-barber-by-user-id"
import { BarberSettingsClient } from "./barber-settings-client"

export default async function BarberAgendaPage() {
  const { id: userId } = await getBarberSession()
  const barber = await getBarberByUserId(userId)
  if (!barber) throw new Error("Barbeiro não encontrado")

  return (
    <BarberSettingsClient
      initialSchedules={barber.schedules}
      barbershopSchedules={barber.barbershop.schedules}
      initialBreaks={barber.breaks}
      initialBlockedSlots={barber.blockedSlots.map((s) => ({
        id: s.id,
        startAt: s.startAt,
        endAt: s.endAt,
        reason: s.reason,
      }))}
    />
  )
}
