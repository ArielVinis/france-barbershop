"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Coffee, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  upsertBarberSchedules,
  type BarberScheduleInput,
} from "@/src/features/barber/_actions/upsert-barber-schedules"
import { createBarberBreak } from "@/src/features/barber/_actions/create-barber-break"
import { deleteBarberBreak } from "@/src/features/barber/_actions/delete-barber-break"
import { createBarberBlockedSlot } from "@/src/features/barber/_actions/create-barber-blocked-slot"
import { deleteBarberBlockedSlot } from "@/src/features/barber/_actions/delete-barber-blocked-slot"

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]

type ScheduleRow = BarberScheduleInput

type BarberBreakItem = {
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

type BarberSettingsClientProps = {
  initialSchedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }>
  barbershopSchedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }>
  initialBreaks: BarberBreakItem[]
  initialBlockedSlots: BlockedSlotItem[]
}

function buildScheduleRows(
  barberSchedules: BarberSettingsClientProps["initialSchedules"],
  barbershopSchedules: BarberSettingsClientProps["barbershopSchedules"],
): ScheduleRow[] {
  const byDay = new Map(barberSchedules.map((s) => [s.dayOfWeek, s]))
  const shopByDay = new Map(barbershopSchedules.map((s) => [s.dayOfWeek, s]))
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const barber = byDay.get(dayOfWeek)
    const shop = shopByDay.get(dayOfWeek)
    return {
      dayOfWeek,
      isActive: barber?.isActive ?? shop?.isActive ?? false,
      startTime: barber?.startTime ?? shop?.startTime ?? "09:00",
      endTime: barber?.endTime ?? shop?.endTime ?? "18:00",
    }
  })
}

export function BarberSettingsClient({
  initialSchedules,
  barbershopSchedules,
  initialBreaks,
  initialBlockedSlots,
}: BarberSettingsClientProps) {
  const [schedules, setSchedules] = useState<ScheduleRow[]>(() =>
    buildScheduleRows(initialSchedules, barbershopSchedules),
  )
  const [breaks, setBreaks] = useState<BarberBreakItem[]>(initialBreaks)
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
        await upsertBarberSchedules(schedules)
        toast.success("Dias de trabalho salvos")
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
        const created = await createBarberBreak(newBreak)
        toast.success("Pausa adicionada")
        setBreaks((prev) => [...prev, created])
        setNewBreak({ dayOfWeek: 1, startTime: "12:00", endTime: "13:00" })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao adicionar pausa")
      }
    })
  }

  const handleRemoveBreak = (id: string) => {
    startBreakTransition(async () => {
      try {
        await deleteBarberBreak(id)
        toast.success("Pausa removida")
        setBreaks((prev) => prev.filter((b) => b.id !== id))
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
        const created = await createBarberBlockedSlot({
          startAt,
          endAt,
          reason: newBlock.reason.trim() || null,
        })
        toast.success("Horário bloqueado")
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
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao bloquear")
      }
    })
  }

  const handleRemoveBlockedSlot = (id: string) => {
    startBlockTransition(async () => {
      try {
        await deleteBarberBlockedSlot(id)
        toast.success("Bloqueio removido")
        setBlockedSlots((prev) => prev.filter((s) => s.id !== id))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao remover")
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configurar agenda</h1>
        <p className="text-muted-foreground">
          Defina seus dias de trabalho, horários, pausas e bloqueios (ex.:
          férias).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dias de trabalho
          </CardTitle>
          <CardDescription>
            Marque os dias em que você atende e configure o horário de início e
            fim de cada dia.
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
            {isPendingSchedules ? "Salvando…" : "Salvar dias de trabalho"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Pausas
          </CardTitle>
          <CardDescription>
            Configure pausas recorrentes por dia (ex.: almoço das 12h às 13h).
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
            Bloquear horários
          </CardTitle>
          <CardDescription>
            Bloqueie períodos específicos (ex.: férias, consultas). Nenhum
            agendamento será permitido nesses intervalos.
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
                placeholder="Ex.: Férias"
                value={newBlock.reason}
                onChange={(e) =>
                  setNewBlock((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="w-[160px]"
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
