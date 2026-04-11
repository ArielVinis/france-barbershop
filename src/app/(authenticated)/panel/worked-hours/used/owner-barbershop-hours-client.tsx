"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PATHS } from "@/src/constants/PATHS"
import { SHOP_QUERY_PARAM } from "@/src/lib/panel/shop-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Coffee, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  upsertBarbershopSchedulesOwner,
  type BarbershopScheduleInput,
} from "@/src/features/owner/_actions/upsert-barbershop-schedules-owner"
import { createBarbershopBreakOwner } from "@/src/features/owner/_actions/create-barbershop-break-owner"
import { deleteBarbershopBreakOwner } from "@/src/features/owner/_actions/delete-barbershop-break-owner"
import { createBarbershopBlockedSlotOwner } from "@/src/features/owner/_actions/create-barbershop-blocked-slot-owner"
import { deleteBarbershopBlockedSlotOwner } from "@/src/features/owner/_actions/delete-barbershop-blocked-slot-owner"

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]

type ScheduleRow = BarbershopScheduleInput

type BreakItem = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

type BlockedSlotItem = {
  id: string
  startAt: Date
  endAt: Date
  reason: string | null
}

type OwnerBarbershopHoursClientProps = {
  barbershopId: string
  barbershops: { id: string; name: string }[]
  initialSchedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }>
  initialBreaks: BreakItem[]
  initialBlockedSlots: BlockedSlotItem[]
}

function buildScheduleRows(
  shopSchedules: OwnerBarbershopHoursClientProps["initialSchedules"],
): ScheduleRow[] {
  const byDay = new Map(shopSchedules.map((s) => [s.dayOfWeek, s]))
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const s = byDay.get(dayOfWeek)
    return {
      dayOfWeek,
      isActive: s?.isActive ?? false,
      startTime: s?.startTime ?? "09:00",
      endTime: s?.endTime ?? "18:00",
    }
  })
}

export function OwnerBarbershopHoursClient({
  barbershopId,
  barbershops,
  initialSchedules,
  initialBreaks,
  initialBlockedSlots,
}: OwnerBarbershopHoursClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [schedules, setSchedules] = useState<ScheduleRow[]>(() =>
    buildScheduleRows(initialSchedules),
  )
  const [breaks, setBreaks] = useState<BreakItem[]>(initialBreaks)
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlotItem[]>(
    initialBlockedSlots.map((s) => ({
      ...s,
      startAt: new Date(s.startAt),
      endAt: new Date(s.endAt),
    })),
  )

  const [isPendingSchedules, startSchedulesTransition] = useTransition()
  const [isPendingBreak, startBreakTransition] = useTransition()
  const [isPendingBlock, startBlockTransition] = useTransition()

  const handleBarbershopChange = (nextId: string) => {
    const next = new URLSearchParams(searchParams.toString())
    next.set(SHOP_QUERY_PARAM, nextId)
    router.push(`${PATHS.PANEL.WORKED_HOURS}?${next.toString()}`)
  }

  const handleScheduleChange = (
    dayOfWeek: number,
    field: keyof ScheduleRow,
    value: string | boolean,
  ) => {
    setSchedules((prev) =>
      prev.map((row) =>
        row.dayOfWeek === dayOfWeek ? { ...row, [field]: value } : row,
      ),
    )
  }

  const handleSaveSchedules = () => {
    startSchedulesTransition(async () => {
      try {
        await upsertBarbershopSchedulesOwner(barbershopId, schedules)
        toast.success("Horários de funcionamento salvos")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar")
      }
    })
  }

  const [newBreak, setNewBreak] = useState({
    dayOfWeek: 1,
    startTime: "12:00",
    endTime: "13:00",
  })

  const handleAddBreak = () => {
    startBreakTransition(async () => {
      try {
        const created = await createBarbershopBreakOwner(barbershopId, newBreak)
        toast.success("Pausa adicionada")
        setBreaks((prev) => [...prev, created])
        setNewBreak({ dayOfWeek: 1, startTime: "12:00", endTime: "13:00" })
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao adicionar pausa")
      }
    })
  }

  const handleRemoveBreak = (id: string) => {
    startBreakTransition(async () => {
      try {
        await deleteBarbershopBreakOwner(id)
        toast.success("Pausa removida")
        setBreaks((prev) => prev.filter((b) => b.id !== id))
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao remover")
      }
    })
  }

  const [newBlock, setNewBlock] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  })

  const handleAddBlockedSlot = () => {
    if (!newBlock.startDate || !newBlock.endDate) {
      toast.error("Informe data de início e fim")
      return
    }
    const startAt = new Date(newBlock.startDate + "T00:00:00")
    const endAt = new Date(newBlock.endDate + "T23:59:59")
    if (startAt >= endAt) {
      toast.error("Data de fim deve ser após o início")
      return
    }
    startBlockTransition(async () => {
      try {
        const created = await createBarbershopBlockedSlotOwner(barbershopId, {
          startAt,
          endAt,
          reason: newBlock.reason.trim() || null,
        })
        toast.success("Período bloqueado")
        setBlockedSlots((prev) => [
          ...prev,
          {
            id: created.id,
            startAt: created.startAt,
            endAt: created.endAt,
            reason: created.reason,
          },
        ])
        setNewBlock({ startDate: "", endDate: "", reason: "" })
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao bloquear")
      }
    })
  }

  const handleRemoveBlockedSlot = (id: string) => {
    startBlockTransition(async () => {
      try {
        await deleteBarbershopBlockedSlotOwner(id)
        toast.success("Bloqueio removido")
        setBlockedSlots((prev) => prev.filter((s) => s.id !== id))
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao remover")
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
      {barbershops.length > 1 && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>Barbearia</Label>
            <Select value={barbershopId} onValueChange={handleBarbershopChange}>
              <SelectTrigger className="w-[min(100%,280px)]">
                <SelectValue placeholder="Selecione" />
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
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Gestão de horários</h1>
        <p className="text-muted-foreground">
          Horário de funcionamento da barbearia, pausas recorrentes (ex.:
          almoço) e bloqueios para feriados ou dias especiais. Afeta a
          disponibilidade pública de agendamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Funcionamento por dia da semana
          </CardTitle>
          <CardDescription>
            Marque os dias em que a barbearia abre e defina início e fim do
            expediente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {schedules.map((row) => (
              <div
                key={row.dayOfWeek}
                className="flex flex-wrap items-center gap-4 rounded-lg border p-3"
              >
                <label className="flex min-w-[120px] cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    onChange={(e) =>
                      handleScheduleChange(
                        row.dayOfWeek,
                        "isActive",
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="font-medium">
                    {DAY_NAMES[row.dayOfWeek]}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={row.startTime}
                    onChange={(e) =>
                      handleScheduleChange(
                        row.dayOfWeek,
                        "startTime",
                        e.target.value,
                      )
                    }
                    disabled={!row.isActive}
                    className="w-[120px]"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="time"
                    value={row.endTime}
                    onChange={(e) =>
                      handleScheduleChange(
                        row.dayOfWeek,
                        "endTime",
                        e.target.value,
                      )
                    }
                    disabled={!row.isActive}
                    className="w-[120px]"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleSaveSchedules} disabled={isPendingSchedules}>
            {isPendingSchedules ? "Salvando…" : "Salvar horários"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Pausas da barbearia
          </CardTitle>
          <CardDescription>
            Intervalos em que nenhum atendimento é oferecido (ex.: almoço
            coletivo das 12h às 13h).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {breaks.length > 0 && (
            <ul className="space-y-2">
              {breaks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span>
                    <strong>{DAY_NAMES[b.dayOfWeek]}</strong> — {b.startTime} às{" "}
                    {b.endTime}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBreak(b.id)}
                    disabled={isPendingBreak}
                    aria-label="Remover pausa"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-3 rounded-lg border p-3">
            <div className="space-y-1">
              <Label>Dia</Label>
              <select
                value={newBreak.dayOfWeek}
                onChange={(e) =>
                  setNewBreak((prev) => ({
                    ...prev,
                    dayOfWeek: Number(e.target.value),
                  }))
                }
                className="h-10 w-[140px] rounded-md border border-input bg-background px-3 text-sm"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Início</Label>
              <Input
                type="time"
                value={newBreak.startTime}
                onChange={(e) =>
                  setNewBreak((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-[120px]"
              />
            </div>
            <div className="space-y-1">
              <Label>Fim</Label>
              <Input
                type="time"
                value={newBreak.endTime}
                onChange={(e) =>
                  setNewBreak((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="w-[120px]"
              />
            </div>
            <Button onClick={handleAddBreak} disabled={isPendingBreak}>
              Adicionar pausa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Feriados e dias especiais
          </CardTitle>
          <CardDescription>
            Bloqueie intervalos de datas (feriados, reforma, eventos). Nenhum
            horário será oferecido nesses períodos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockedSlots.length > 0 && (
            <ul className="space-y-2">
              {blockedSlots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span>
                    {format(s.startAt, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                    {format(s.endAt, "dd/MM/yyyy", { locale: ptBR })}
                    {s.reason && (
                      <span className="ml-2 text-muted-foreground">
                        ({s.reason})
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBlockedSlot(s.id)}
                    disabled={isPendingBlock}
                    aria-label="Remover bloqueio"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-3 rounded-lg border p-3">
            <div className="space-y-1">
              <Label>Data início</Label>
              <Input
                type="date"
                value={newBlock.startDate}
                onChange={(e) =>
                  setNewBlock((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label>Data fim</Label>
              <Input
                type="date"
                value={newBlock.endDate}
                onChange={(e) =>
                  setNewBlock((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ex.: Feriado nacional"
                value={newBlock.reason}
                onChange={(e) =>
                  setNewBlock((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="min-w-[160px] max-w-[220px]"
              />
            </div>
            <Button onClick={handleAddBlockedSlot} disabled={isPendingBlock}>
              Bloquear período
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
