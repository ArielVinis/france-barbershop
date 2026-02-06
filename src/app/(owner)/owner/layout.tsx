import { redirect } from "next/navigation"
import { getOwnerSession } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { OwnerLayoutClient } from "@/src/components/owner/owner-layout-client"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { id: userId } = await getOwnerSession()

  const owner = await getOwnerByUserId(userId)
  if (!owner || owner.barbershops.length === 0) {
    redirect("/")
  }

  return (
    <OwnerLayoutClient user={owner.user} barbershops={owner.barbershops}>
      {children}
    </OwnerLayoutClient>
  )
}
