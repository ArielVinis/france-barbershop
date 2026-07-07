import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ProfileForm } from "@/src/components/profile/profile-form"
import { getUserProfile } from "@/src/features/user/user.actions"
import { auth } from "@/src/shared/lib/auth"
import { PATHS } from "@/src/shared/constants/PATHS"

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(PATHS.ROOT)
  }

  const profile = await getUserProfile()

  if (!profile) {
    redirect(PATHS.ROOT)
  }

  return (
    <div className="space-y-3 p-5">
      <h1 className="text-xl font-bold">Meu perfil</h1>
      <p className="text-sm text-muted-foreground">
        Gerencie seu nome, foto, telefone e e-mail.
      </p>
      <ProfileForm profile={profile} />
    </div>
  )
}
