import { getCurrentUser } from "@/src/lib/auth"
import { getBarberByUserId } from "@/src/features/barber/_data/get-barber-by-user-id"
import { BarberSettingsClient } from "./used/barber-settings-client"

export default async function BarberAgendaPage() {
  const user = await getCurrentUser()
  const barber = await getBarberByUserId(user.id)
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
