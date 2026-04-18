import { redirect } from "next/navigation"
import { SHOP_QUERY_PARAM } from "@/src/lib/panel/shop-query"

export function ensureBarberShopIdMatchesUrl(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  linkedBarbershopId: string,
) {
  const raw = searchParams[SHOP_QUERY_PARAM]?.trim()
  if (raw === linkedBarbershopId) return

  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v === undefined || v === "") continue
    if (k === SHOP_QUERY_PARAM) continue
    query.set(k, v)
  }
  query.set(SHOP_QUERY_PARAM, linkedBarbershopId)
  redirect(`${pathname}?${query.toString()}`)
}
