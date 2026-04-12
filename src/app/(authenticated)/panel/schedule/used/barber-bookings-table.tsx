"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreVerticalIcon, XCircleIcon, UserXIcon } from "lucide-react"
import { toast } from "sonner"
import type { PaymentMethod } from "@/prisma/generated/prisma/client"
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
import { updateBookingStatus } from "@/src/features/barber/_actions/update-booking-status"

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
    typeof import("@/src/features/barber/_data/get-barber-bookings").getBarberBookings
  >
>[number]

type BarberBookingsTableProps = {
  bookings: BookingRow[]
}

export function BarberBookingsTable({ bookings }: BarberBookingsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<{
    bookingId: string
    status: "CANCELLED" | "NO_SHOW"
    label: string
  } | null>(null)
  const [finishDialog, setFinishDialog] = useState<{
    bookingId: string
    paymentMethod: PaymentMethod
  } | null>(null)

  const runConfirm = () => {
    if (!confirmAction) return
    startTransition(async () => {
      try {
        await updateBookingStatus(confirmAction.bookingId, confirmAction.status)
        toast.success(
          confirmAction.status === "CANCELLED"
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

  const runFinish = () => {
    if (!finishDialog) return
    startTransition(async () => {
      try {
        await updateBookingStatus(finishDialog.bookingId, "FINISHED", {
          paymentMethod: finishDialog.paymentMethod,
          paymentStatus: "PAID",
        })
        toast.success("Atendimento finalizado")
        setFinishDialog(null)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao finalizar")
      }
    })
  }

  const startService = (bookingId: string) => {
    startTransition(async () => {
      try {
        await updateBookingStatus(bookingId, "IN_PROGRESS")
        toast.success("Atendimento iniciado")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao iniciar")
      }
    })
  }

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
                  {b.status === "CONFIRMED" && (
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
                        <DropdownMenuItem onClick={() => startService(b.id)}>
                          Iniciar atendimento
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
                  {b.status === "IN_PROGRESS" && (
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
                        <DropdownMenuItem
                          onClick={() =>
                            setFinishDialog({
                              bookingId: b.id,
                              paymentMethod: "PIX",
                            })
                          }
                        >
                          Finalizar atendimento…
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
                          Cancelar
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
              onClick={runConfirm}
              disabled={isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!finishDialog}
        onOpenChange={(open) => !open && setFinishDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar atendimento</DialogTitle>
            <DialogDescription>
              Informe como o pagamento foi recebido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Select
                value={finishDialog?.paymentMethod ?? "PIX"}
                onValueChange={(v) =>
                  setFinishDialog((prev) =>
                    prev
                      ? { ...prev, paymentMethod: v as PaymentMethod }
                      : null,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CASH">Dinheiro</SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartão crédito</SelectItem>
                  <SelectItem value="DEBIT_CARD">Cartão débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={runFinish} disabled={isPending}>
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
