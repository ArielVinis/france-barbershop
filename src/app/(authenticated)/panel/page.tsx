import { Suspense } from "react"
import { Role } from "@/prisma/generated/prisma/enums"
import { OrganizationSwitcher } from "@/src/components/auth/organization-switcher"
import { PanelPage } from "@/src/app/(authenticated)/panel/_components/panel-page"
import { PanelDashboardSection } from "@/src/app/(authenticated)/panel/_components/panel-dashboard-section"
import { PanelWelcomeToast } from "@/src/app/(authenticated)/panel/_components/panel-welcome-toast"
import { getOrganizations } from "@/src/features/organization/organization.actions"
import { getCurrentUser } from "@/src/server/auth/users"

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; organizationId?: string }>
}) {
  const { user } = await getCurrentUser()
  const params = await searchParams
  const organizations =
    user.role === Role.OWNER || user.role === Role.MANAGER
      ? await getOrganizations()
      : []

  const title = user.role === Role.MEMBER ? "Painel do barbeiro" : "Painel"

  return (
    <PanelPage
      title={title}
      rightContent={
        organizations.length > 0 ? (
          <OrganizationSwitcher organizations={organizations} />
        ) : undefined
      }
    >
      <Suspense fallback={null}>
        <PanelWelcomeToast />
      </Suspense>
      <PanelDashboardSection user={user} searchParams={params} />
    </PanelPage>
  )
}
