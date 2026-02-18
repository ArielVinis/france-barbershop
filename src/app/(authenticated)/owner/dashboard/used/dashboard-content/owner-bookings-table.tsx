"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreVerticalIcon, XCircleIcon, UserXIcon } from "lucide-react"
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
import { updateBookingStatusOwner } from "@/src/features/owner/_actions/update-booking-status-owner"

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

type OwnerBookingsTableProps = {
  bookings: BookingRow[]
}

export function OwnerBookingsTable({ bookings }: OwnerBookingsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<{
    bookingId: string
    status: "CANCELLED" | "NO_SHOW"
    label: string
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
    </>
  )
}
