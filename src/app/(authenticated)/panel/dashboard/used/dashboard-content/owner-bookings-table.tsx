"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  MoreVerticalIcon,
  XCircleIcon,
  UserXIcon,
  CalendarClockIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Input } from "@/src/components/ui/input"
import { updateBookingStatusOwner } from "@/src/features/owner/_actions/update-booking-status-owner"
import { rescheduleBookingOwner } from "@/src/features/owner/_actions/reschedule-booking-owner"

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
}

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
}

type BookingRow = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-bookings").getOwnerBookings
  >
>[number]

type BarberOption = { id: string; name: string; barbershopId: string }

type OwnerBookingsTableProps = {
  bookings: BookingRow[]
  barbers: BarberOption[]
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function OwnerBookingsTable({
  bookings,
  barbers,
}: OwnerBookingsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<{
    bookingId: string
    status: "CANCELLED" | "NO_SHOW"
    label: string
  } | null>(null)
  const [rescheduleBooking, setRescheduleBooking] = useState<{
    booking: BookingRow
    newDateTime: string
    barberId: string
  } | null>(null)

  const runAction = (bookingId: string, status: "CANCELLED" | "NO_SHOW") => {
    startTransition(async () => {
      try {
        await updateBookingStatusOwner(bookingId, status)
        toast.success(
          status === "CANCELLED"
            ? "Agendamento cancelado"
            : "Marcado como não compareceu",
        )
        setConfirmAction(null)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao atualizar")
      }
    })
  }

  const openReschedule = (booking: BookingRow) => {
    setRescheduleBooking({
      booking,
      newDateTime: toDatetimeLocal(new Date(booking.date)),
      barberId: booking.barber?.id ?? "",
    })
  }

  const runReschedule = () => {
    if (!rescheduleBooking) return
    const { booking, newDateTime, barberId } = rescheduleBooking
    const newDate = new Date(newDateTime)
    if (Number.isNaN(newDate.getTime())) {
      toast.error("Data e hora inválidas")
      return
    }
    startTransition(async () => {
      try {
        await rescheduleBookingOwner(booking.id, newDate, barberId || undefined)
        toast.success("Agendamento realocado")
        setRescheduleBooking(null)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao realocar")
      }
    })
  }

  const barbersForReschedule = rescheduleBooking
    ? barbers.filter(
        (b) =>
          b.barbershopId === rescheduleBooking.booking.service.barbershopId,
      )
    : []

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum agendamento no período selecionado.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Barbeiro</TableHead>
              <TableHead>Data e hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="font-medium">{b.user.name}</div>
                  {b.user.phone && (
                    <div className="text-xs text-muted-foreground">
                      {b.user.phone}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>{b.service.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(b.service.price))}
                  </div>
                </TableCell>
                <TableCell>{b.barber?.user.name ?? "—"}</TableCell>
                <TableCell>
                  {format(b.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {STATUS_LABEL[b.status] ?? b.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {PAYMENT_LABEL[b.paymentStatus ?? "PENDING"] ??
                      b.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(b.status === "CONFIRMED" || b.status === "IN_PROGRESS") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isPending}
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openReschedule(b)}>
                          <CalendarClockIcon className="mr-2 h-4 w-4" />
                          Realocar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            setConfirmAction({
                              bookingId: b.id,
                              status: "CANCELLED",
                              label: "Cancelar agendamento",
                            })
                          }
                        >
                          <XCircleIcon className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({
                              bookingId: b.id,
                              status: "NO_SHOW",
                              label: "Cliente não compareceu",
                            })
                          }
                        >
                          <UserXIcon className="mr-2 h-4 w-4" />
                          Não compareceu
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.label}</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3">
            <DialogClose asChild>
              <Button variant="outline">Voltar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                confirmAction &&
                runAction(confirmAction.bookingId, confirmAction.status)
              }
            >
              {isPending ? "Confirmando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rescheduleBooking}
        onOpenChange={(open) => !open && setRescheduleBooking(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Realocar agendamento</DialogTitle>
            <DialogDescription>
              Altere a data/hora e opcionalmente o barbeiro.
            </DialogDescription>
          </DialogHeader>
          {rescheduleBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reschedule-datetime">Nova data e hora</Label>
                <Input
                  id="reschedule-datetime"
                  type="datetime-local"
                  value={rescheduleBooking.newDateTime}
                  onChange={(e) =>
                    setRescheduleBooking((prev) =>
                      prev ? { ...prev, newDateTime: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Barbeiro</Label>
                <Select
                  value={rescheduleBooking.barberId || "same"}
                  onValueChange={(v) =>
                    setRescheduleBooking((prev) =>
                      prev
                        ? {
                            ...prev,
                            barberId: v === "same" ? "" : v,
                          }
                        : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Manter atual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">
                      {rescheduleBooking.booking.barber?.user.name ?? "—"}
                      {" (manter)"}
                    </SelectItem>
                    {barbersForReschedule
                      .filter(
                        (br) => br.id !== rescheduleBooking.booking.barber?.id,
                      )
                      .map((br) => (
                        <SelectItem key={br.id} value={br.id}>
                          {br.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-row gap-3">
            <DialogClose asChild>
              <Button variant="outline">Voltar</Button>
            </DialogClose>
            <Button disabled={isPending} onClick={() => runReschedule()}>
              {isPending ? "Realocando…" : "Realocar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
