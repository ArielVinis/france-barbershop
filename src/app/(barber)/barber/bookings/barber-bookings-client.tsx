"use client"

import { useState, useEffect } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  Play,
  Square,
  User,
  Phone,
  Mail,
  Calendar,
  XCircle,
  UserX,
} from "lucide-react"
import { toast } from "sonner"
import { updateBookingStatus } from "@/src/features/barber/_actions/update-booking-status"
import { updateBookingObservations } from "@/src/features/barber/_actions/update-booking-observations"
import type { PaymentMethod } from "@prisma/client"

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
}

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
  const [barberObservations, setBarberObservations] = useState(
    () => booking.observations ?? "",
  )
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethod | ""
  >("")

  useEffect(() => {
    if (sheetOpen) setBarberObservations(booking.observations ?? "")
  }, [sheetOpen, booking.id, booking.observations])

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

  const handleFinishClick = () => setFinishDialogOpen(true)

  const handleFinishConfirm = async () => {
    setLoading("finish")
    try {
      await updateBookingStatus(booking.id, "FINISHED", {
        paymentMethod: selectedPaymentMethod || undefined,
        paymentStatus: selectedPaymentMethod ? "PAID" : undefined,
      })
      toast.success("Atendimento finalizado")
      onStatusChange()
      setSheetOpen(false)
      setFinishDialogOpen(false)
      setSelectedPaymentMethod("")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar")
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async () => {
    setLoading("cancel")
    try {
      await updateBookingStatus(booking.id, "CANCELLED")
      toast.success("Agendamento cancelado")
      onStatusChange()
      setSheetOpen(false)
      setCancelDialogOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cancelar")
    } finally {
      setLoading(null)
    }
  }

  const handleNoShow = async () => {
    setLoading("noShow")
    try {
      await updateBookingStatus(booking.id, "NO_SHOW")
      toast.success("Marcado como não compareceu")
      onStatusChange()
      setSheetOpen(false)
      setNoShowDialogOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar")
    } finally {
      setLoading(null)
    }
  }

  const handleSaveObservations = async () => {
    setLoading("observations")
    try {
      await updateBookingObservations(
        booking.id,
        barberObservations.trim() || null,
      )
      toast.success("Observações salvas")
      onStatusChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar observações")
    } finally {
      setLoading(null)
    }
  }

  const canStart = booking.status === "CONFIRMED"
  const canFinish = booking.status === "IN_PROGRESS"
  const canCancelOrNoShow =
    booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS"

  return (
    <>
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
            {booking.status === "FINISHED" && booking.paymentMethod && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Pagamento
                </p>
                <p className="text-sm font-medium">
                  {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                </p>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Observações (barbeiro)
              </p>
              <textarea
                placeholder="Ex.: preferência de corte, alergia, observação do atendimento..."
                maxLength={500}
                value={barberObservations}
                onChange={(e) => setBarberObservations(e.target.value)}
                className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {barberObservations.length}/500
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    !!loading ||
                    barberObservations.trim() ===
                      (booking.observations ?? "").trim()
                  }
                  onClick={handleSaveObservations}
                >
                  {loading === "observations"
                    ? "Salvando…"
                    : "Salvar observação"}
                </Button>
              </div>
            </div>
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
                  onClick={handleFinishClick}
                  disabled={!!loading}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <Square size={18} />
                  Finalizar atendimento
                </Button>
              )}
              {canCancelOrNoShow && (
                <>
                  <Button
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={!!loading}
                    variant="outline"
                    className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XCircle size={18} />
                    Cancelar agendamento
                  </Button>
                  <Button
                    onClick={() => setNoShowDialogOpen(true)}
                    disabled={!!loading}
                    variant="outline"
                    className="w-full gap-2 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
                  >
                    <UserX size={18} />
                    Cliente não compareceu
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar atendimento</DialogTitle>
            <DialogDescription>
              Selecione o modo de pagamento realizado para relatórios
              (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <p className="text-sm font-medium text-muted-foreground">
              Modo de pagamento
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(PAYMENT_METHOD_LABELS) as [
                  PaymentMethod,
                  string,
                ][]
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant={
                    selectedPaymentMethod === value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setSelectedPaymentMethod((prev) =>
                      prev === value ? "" : value,
                    )
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFinishDialogOpen(false)
                setSelectedPaymentMethod("")
              }}
            >
              Voltar
            </Button>
            <Button onClick={handleFinishConfirm} disabled={!!loading}>
              {loading === "finish" ? "Finalizando…" : "Finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar agendamento?</DialogTitle>
            <DialogDescription>
              O cliente solicitou cancelamento ou deseja cancelar este
              agendamento. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!!loading}
            >
              {loading === "cancel" ? "Cancelando…" : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cliente não compareceu?</DialogTitle>
            <DialogDescription>
              Marcar como não compareceu indica que o cliente não apareceu no
              horário. Útil para relatórios e histórico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoShowDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="secondary"
              onClick={handleNoShow}
              disabled={!!loading}
              className="text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
            >
              {loading === "noShow" ? "Salvando…" : "Marcar não compareceu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function BarberBookingsClient({
  bookingsDay,
  bookingsWeek,
  bookingsMonth,
}: {
  bookingsDay: BookingWithRelations[]
  bookingsWeek: BookingWithRelations[]
  bookingsMonth: BookingWithRelations[]
}) {
  const router = useRouter()
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  const bookings =
    period === "day"
      ? bookingsDay
      : period === "week"
        ? bookingsWeek
        : bookingsMonth

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
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "month"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Mês
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
                : period === "week"
                  ? "Você não tem agendamentos nesta semana."
                  : "Você não tem agendamentos nesse mês."}
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
