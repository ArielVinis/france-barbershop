"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarImage } from "@/src/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import { Play, Square, User, Phone, Mail, Calendar } from "lucide-react"
import { toast } from "sonner"
import { updateBookingStatus } from "@/src/features/barber/_actions/update-booking-status"

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CONFIRMED: "default",
  IN_PROGRESS: "secondary",
  FINISHED: "outline",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

type BookingWithRelations = Awaited<
  ReturnType<
    typeof import("@/src/features/barber/_data/get-barber-bookings").getBarberBookings
  >
>[number]

function BarberBookingCard({
  booking,
  onStatusChange,
}: {
  booking: BookingWithRelations
  onStatusChange: () => void
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleStart = async () => {
    setLoading("start")
    try {
      await updateBookingStatus(booking.id, "IN_PROGRESS")
      toast.success("Atendimento iniciado")
      onStatusChange()
      setSheetOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao iniciar")
    } finally {
      setLoading(null)
    }
  }

  const handleFinish = async () => {
    setLoading("finish")
    try {
      await updateBookingStatus(booking.id, "FINISHED")
      toast.success("Atendimento finalizado")
      onStatusChange()
      setSheetOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar")
    } finally {
      setLoading(null)
    }
  }

  const canStart = booking.status === "CONFIRMED"
  const canFinish = booking.status === "IN_PROGRESS"

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card className="cursor-pointer transition-opacity hover:opacity-90">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:flex-nowrap">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </Badge>
                <span className="font-semibold">{booking.service.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(booking.date, "EEEE, d 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end text-right text-sm">
              <span className="font-medium">
                {format(booking.date, "HH:mm", { locale: ptBR })}
              </span>
              <span className="text-muted-foreground">
                {booking.service.durationMinutes} min
              </span>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Atendimento</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Status
            </p>
            <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>
              {STATUS_LABEL[booking.status] ?? booking.status}
            </Badge>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Cliente
            </p>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={booking.user.image ?? ""}
                  alt={booking.user.name ?? ""}
                />
              </Avatar>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-semibold">{booking.user.name}</p>
                {booking.user.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone size={14} />
                    {booking.user.phone}
                  </div>
                )}
                {booking.user.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail size={14} />
                    {booking.user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Serviço
            </p>
            <p className="font-medium">{booking.service.name}</p>
            <p className="text-sm text-muted-foreground">
              {booking.service.durationMinutes} min •{" "}
              {Number(booking.service.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Data e hora
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              {format(booking.date, "EEEE, d 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>
          {booking.observations && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Observações
              </p>
              <p className="text-sm">{booking.observations}</p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-4">
            {canStart && (
              <Button
                onClick={handleStart}
                disabled={!!loading}
                className="w-full gap-2"
              >
                <Play size={18} />
                Iniciar atendimento
              </Button>
            )}
            {canFinish && (
              <Button
                onClick={handleFinish}
                disabled={!!loading}
                variant="secondary"
                className="w-full gap-2"
              >
                <Square size={18} />
                Finalizar atendimento
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function BarberBookingsClient({
  bookingsDay,
  bookingsWeek,
}: {
  bookingsDay: BookingWithRelations[]
  bookingsWeek: BookingWithRelations[]
}) {
  const router = useRouter()
  const [period, setPeriod] = useState<"day" | "week">("day")
  const bookings = period === "day" ? bookingsDay : bookingsWeek

  const refresh = () => router.refresh()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Meus agendamentos</h1>
        <div className="flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setPeriod("day")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "day"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "week"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Semana
          </button>
        </div>
      </div>
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 font-medium">Nenhum agendamento</p>
            <p className="text-sm text-muted-foreground">
              {period === "day"
                ? "Você não tem agendamentos para hoje."
                : "Você não tem agendamentos nesta semana."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BarberBookingCard booking={booking} onStatusChange={refresh} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
