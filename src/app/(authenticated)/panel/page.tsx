import { getCurrentUser } from "@/src/lib/auth"
import { PanelDashboardSection } from "@/src/app/(authenticated)/panel/_components/panel-dashboard-section"

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; shopId?: string }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  return <PanelDashboardSection user={user} searchParams={params} />
}
