"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { setCurrentUserAsOwner } from "@/src/features/dev/_actions/set-current-user-as-owner"

type DevOwnerFormProps = {
  user: { name?: string | null; email?: string | null; role?: string }
  barbershops: { id: string; name: string; slug: string }[]
}

export function DevOwnerForm({ user, barbershops }: DevOwnerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [barbershopId, setBarbershopId] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barbershopId) {
      toast.error("Selecione uma barbearia")
      return
    }
    startTransition(async () => {
      try {
        await setCurrentUserAsOwner(barbershopId)
        toast.success("Pronto! Você é dono desta barbearia. Redirecionando…")
        router.push("/owner")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao vincular")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="rounded-md bg-muted/50 p-3 text-sm">
        <p className="font-medium">Logado como</p>
        <p className="text-muted-foreground">
          {user.name ?? "—"} {user.email && `(${user.email})`}
        </p>
        {user.role && (
          <p className="mt-1 text-xs text-muted-foreground">
            Role atual: <strong>{user.role}</strong>
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="barbershop">Barbearia</Label>
        <Select
          value={barbershopId}
          onValueChange={setBarbershopId}
          disabled={isPending}
        >
          <SelectTrigger id="barbershop">
            <SelectValue placeholder="Selecione uma barbearia" />
          </SelectTrigger>
          <SelectContent>
            {barbershops.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Vinculando…" : "Tornar-me dono desta barbearia"}
      </Button>
    </form>
  )
}
