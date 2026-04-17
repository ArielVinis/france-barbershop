import { getCurrentUser } from "@/src/lib/auth"
import { PanelDashboardBarberSection } from "@/src/app/(authenticated)/panel/_components/panel-dashboard-barber-section"
import { PanelDashboardOwnerSection } from "@/src/app/(authenticated)/panel/_components/panel-dashboard-owner-section"

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; shopId?: string }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  if (user.role === "BARBER") {
    return (
      <PanelDashboardBarberSection userId={user.id} searchParams={params} />
    )
  }

  if (user.role === "OWNER") {
    return <PanelDashboardOwnerSection userId={user.id} searchParams={params} />
  }

  return null
}
