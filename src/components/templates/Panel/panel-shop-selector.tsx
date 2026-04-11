"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  isAggregateShopPath,
  SHOP_QUERY_PARAM,
} from "@/src/lib/panel/shop-query"

type BarbershopOption = { id: string; name: string }

type PanelShopSelectorProps = {
  barbershops: BarbershopOption[]
}

export function PanelShopSelector({ barbershops }: PanelShopSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const aggregate = isAggregateShopPath(pathname)

  const raw = searchParams.get(SHOP_QUERY_PARAM)
  const ids = barbershops.map((b) => b.id)

  const effectiveValue = (() => {
    if (barbershops.length === 0) return ""
    if (barbershops.length === 1) return barbershops[0].id
    if (aggregate) {
      if (!raw || raw === "all") return "all"
      if (ids.includes(raw)) return raw
      return "all"
    }
    if (raw && ids.includes(raw)) return raw
    return ids[0] ?? ""
  })()

  // 1 loja: garantir `shopId` na URL para compartilhar estado com o restante do painel
  useEffect(() => {
    if (barbershops.length !== 1) return
    const only = barbershops[0].id
    if (searchParams.get(SHOP_QUERY_PARAM) === only) return
    const next = new URLSearchParams(searchParams.toString())
    next.set(SHOP_QUERY_PARAM, only)
    router.replace(`${pathname}?${next.toString()}`)
  }, [barbershops, pathname, router, searchParams])

  const setShop = (value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (aggregate && value === "all") {
      next.set(SHOP_QUERY_PARAM, "all")
    } else {
      next.set(SHOP_QUERY_PARAM, value)
    }
    router.push(`${pathname}?${next.toString()}`)
  }

  if (barbershops.length === 0) return null

  if (barbershops.length === 1) {
    return (
      <span className="text-sm text-muted-foreground">
        {barbershops[0].name}
      </span>
    )
  }

  return (
    <Select value={effectiveValue} onValueChange={setShop}>
      <SelectTrigger className="w-[min(100vw-8rem,220px)]">
        <SelectValue placeholder="Barbearia" />
      </SelectTrigger>
      <SelectContent>
        {aggregate && <SelectItem value="all">Todas</SelectItem>}
        {barbershops.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
