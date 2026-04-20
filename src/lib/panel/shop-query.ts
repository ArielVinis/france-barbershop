import { redirect } from "next/navigation"
import { PATHS } from "@/src/constants/PATHS"

export const SHOP_QUERY_PARAM = "shopId" as const

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

export function isAggregateShopPath(pathname: string): boolean {
  const base = pathname.replace(/\/$/, "") || "/"
  return base === PATHS.PANEL.ROOT || base === PATHS.PANEL.SCHEDULE
}

export function resolveShopIdForAggregate(
  shopIdParam: string | undefined,
  barbershopIds: string[],
): string | null | "all" {
  if (barbershopIds.length === 0) return null
  if (barbershopIds.length === 1) return barbershopIds[0]

  if (!shopIdParam || shopIdParam === "all") return "all"
  if (barbershopIds.includes(shopIdParam)) return shopIdParam
  return "all"
}

export function resolveScopedShopIdOrRedirect(
  shopIdParam: string | undefined,
  barbershopIds: string[],
  panelPath: string,
  searchParams: Record<string, string | undefined>,
): string {
  if (barbershopIds.length === 0) return ""
  if (barbershopIds.length === 1) return barbershopIds[0]
  if (shopIdParam && barbershopIds.includes(shopIdParam)) return shopIdParam
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== "" && k !== SHOP_QUERY_PARAM) q.set(k, v)
  }
  q.set(SHOP_QUERY_PARAM, barbershopIds[0])
  redirect(`${panelPath}?${q.toString()}`)
}
