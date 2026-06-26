import { getCurrentUser } from "@/src/server/auth/users"
import { PanelDashboardSection } from "@/src/app/(authenticated)/panel/_components/panel-dashboard-section"
import { PanelWelcomeToast } from "@/src/app/(authenticated)/panel/_components/panel-welcome-toast"
import { Suspense } from "react"

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; organizationId?: string }>
}) {
  const { user } = await getCurrentUser()
  const params = await searchParams

  return (
    <>
      <Suspense fallback={null}>
        <PanelWelcomeToast />
      </Suspense>
      <PanelDashboardSection user={user} searchParams={params} />
    </>
  )
}
