import { PanelPage } from "@/src/app/(authenticated)/panel/_components/panel-page"
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
    <PanelPage title="Meu perfil">
      <p className="text-sm text-muted-foreground">
        Gerencie seu nome, foto, telefone e e-mail.
      </p>
      <ProfileForm profile={profile} callbackPath={PATHS.PANEL.PROFILE} />
    </PanelPage>
  )
}
