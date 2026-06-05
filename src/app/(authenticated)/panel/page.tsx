import { getCurrentUser } from "@/src/server/auth/users"
import { PanelDashboardSection } from "@/src/app/(authenticated)/panel/_components/panel-dashboard-section"

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; organizationId?: string }>
}) {
  const { user } = await getCurrentUser()
  const params = await searchParams

  return <PanelDashboardSection user={user} searchParams={params} />
}
