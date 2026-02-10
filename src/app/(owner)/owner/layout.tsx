import { redirect } from "next/navigation"
import { getOwnerSession } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { id: userId } = await getOwnerSession()

  const owner = await getOwnerByUserId(userId)
  if (!owner) {
    redirect("/")
  }

  return <>{children}</>
}
