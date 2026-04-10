"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, ChevronLeftIcon, Clock, Coffee } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { PATHS } from "@/src/constants/PATHS"

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]

export type BarberForOwner = NonNullable<
  Awaited<
    ReturnType<
      typeof import("@/src/features/owner/_data/get-barber-for-owner").getBarberForOwner
    >
  >
>

type OwnerBarberScheduleViewProps = {
  barber: BarberForOwner
}

/** Apenas o conteúdo da agenda (cards), para usar dentro de Dialog. */
export function OwnerBarberScheduleContent({
  barber,
}: OwnerBarberScheduleViewProps) {
  const scheduleRows = (() => {
    const byDay = new Map(barber.schedules.map((s) => [s.dayOfWeek, s]))
    const shopByDay = new Map(
      barber.barbershop.schedules.map((s) => [s.dayOfWeek, s]),
    )
    return Array.from({ length: 7 }, (_, dayOfWeek) => {
      const row = byDay.get(dayOfWeek) ?? shopByDay.get(dayOfWeek)
      return {
        dayOfWeek,
        isActive: row?.isActive ?? false,
        startTime: row?.startTime ?? "09:00",
        endTime: row?.endTime ?? "18:00",
      }
    })
  })()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dias de trabalho
          </CardTitle>
          <CardDescription>
            Horários configurados para este barbeiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {scheduleRows.map(
              (row) =>
                row.isActive && (
                  <li
                    key={row.dayOfWeek}
                    className="flex justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="font-medium">
                      {DAY_NAMES[row.dayOfWeek]}
                    </span>
                    <span className="text-muted-foreground">
                      {row.startTime} — {row.endTime}
                    </span>
                  </li>
                ),
            )}
            {scheduleRows.every((r) => !r.isActive) && (
              <li className="text-muted-foreground">
                Nenhum dia de trabalho configurado.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Pausas
          </CardTitle>
          <CardDescription>
            Pausas recorrentes por dia (ex.: almoço).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {barber.breaks.length > 0 ? (
            <ul className="space-y-2">
              {barber.breaks.map((b) => (
                <li key={b.id} className="rounded-lg border px-3 py-2">
                  <strong>{DAY_NAMES[b.dayOfWeek]}</strong> — {b.startTime} às{" "}
                  {b.endTime}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Nenhuma pausa configurada.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Bloqueios
          </CardTitle>
          <CardDescription>
            Horários bloqueados (ex.: férias, consultas).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {barber.blockedSlots.length > 0 ? (
            <ul className="space-y-2">
              {barber.blockedSlots.map((s) => (
                <li key={s.id} className="rounded-lg border px-3 py-2">
                  {format(s.startAt, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                  {format(s.endAt, "dd/MM/yyyy", { locale: ptBR })}
                  {s.reason && (
                    <span className="ml-2 text-muted-foreground">
                      — {s.reason}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Nenhum bloqueio de horário.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function OwnerBarberScheduleView({
  barber,
}: OwnerBarberScheduleViewProps) {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={PATHS.OWNER.BARBERS}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            Agenda — {barber.user.name ?? "Barbeiro"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {barber.barbershop.name}
          </p>
        </div>
      </div>
      <OwnerBarberScheduleContent barber={barber} />
    </div>
  )
}
