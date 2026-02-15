import { PATHS } from "@/src/constants/PATHS"
import { NotAuthenticatedClient } from "./not-authenticated-client"

export default async function NotAuthenticatedPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl = params.callbackUrl ?? PATHS.HOME

  return <NotAuthenticatedClient callbackUrl={callbackUrl} />
}
