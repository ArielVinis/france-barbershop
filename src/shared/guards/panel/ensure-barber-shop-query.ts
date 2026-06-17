import { redirect } from "next/navigation"
import { ORGANIZATION_QUERY_PARAM } from "@/src/shared/guards/panel/organization-query"

export function ensureBarberShopIdMatchesUrl(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  linkedOrganizationId: string,
) {
  const raw = searchParams[ORGANIZATION_QUERY_PARAM]?.trim()
  if (raw === linkedOrganizationId) return

  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v === undefined || v === "") continue
    if (k === ORGANIZATION_QUERY_PARAM) continue
    query.set(k, v)
  }
  query.set(ORGANIZATION_QUERY_PARAM, linkedOrganizationId)
  redirect(`${pathname}?${query.toString()}`)
}
