"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { PATHS } from "@/src/shared/constants/PATHS"

export function PanelWelcomeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("welcome") !== "1") return

    toast.success("Convite aceito. Bem-vindo ao painel!")
    router.replace(PATHS.PANEL.ROOT)
  }, [router, searchParams])

  return null
}
