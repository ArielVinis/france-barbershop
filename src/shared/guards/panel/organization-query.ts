import { redirect } from "next/navigation"
import { PATHS } from "@/src/shared/constants/PATHS"

export const ORGANIZATION_QUERY_PARAM = "organizationId" as const

export function flattenSearchParams(
  sp: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue
    out[k] = Array.isArray(v) ? v[0] : v
  }
  return out
}

export function isAggregateOrganizationPath(pathname: string): boolean {
  const base = pathname.replace(/\/$/, "") || "/"
  return base === PATHS.PANEL.ROOT || base === PATHS.PANEL.SCHEDULE
}

export function resolveOrganizationIdForAggregate(
  organizationIdParam: string | undefined,
  organizationIds: string[],
): string | null | "all" {
  if (organizationIds.length === 0) return null
  if (organizationIds.length === 1) return organizationIds[0]

  if (!organizationIdParam || organizationIdParam === "all") return "all"
  if (organizationIds.includes(organizationIdParam)) return organizationIdParam
  return "all"
}

export function resolveScopedOrganizationIdOrRedirect(
  organizationIdParam: string | undefined,
  organizationIds: string[],
  panelPath: string,
  searchParams: Record<string, string | undefined>,
): string {
  if (organizationIds.length === 0) return ""
  if (organizationIds.length === 1) return organizationIds[0]
  if (organizationIdParam && organizationIds.includes(organizationIdParam)) {
    return organizationIdParam
  }
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== "" && k !== ORGANIZATION_QUERY_PARAM) {
      q.set(k, v)
    }
  }
  q.set(ORGANIZATION_QUERY_PARAM, organizationIds[0])
  redirect(`${panelPath}?${q.toString()}`)
}
