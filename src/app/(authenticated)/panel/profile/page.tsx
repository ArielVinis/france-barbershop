import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { ProfileForm } from "@/src/components/profile/profile-form"
import { getUserProfile } from "@/src/features/user/user.actions"
import { PATHS } from "@/src/shared/constants/PATHS"
import { redirect } from "next/navigation"

export default async function PanelProfilePage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect(PATHS.AUTH.LOGIN)
  }

  return (
    <>
      <SiteHeader title="Meu perfil" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6">
            <p className="text-sm text-muted-foreground">
              Gerencie seu nome, foto, telefone e e-mail.
            </p>
            <ProfileForm
              profile={profile}
              callbackPath={PATHS.PANEL.PROFILE}
            />
          </div>
        </div>
      </div>
    </>
  )
}
