"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  CalendarIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UserXIcon,
} from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { createBarberOwner } from "@/src/features/owner/_actions/create-barber-owner"
import { deleteBarberOwner } from "@/src/features/owner/_actions/delete-barber-owner"
import { toggleBarberActiveOwner } from "@/src/features/owner/_actions/toggle-barber-active-owner"
import { getBarberScheduleForOwner } from "@/src/features/owner/_actions/get-barber-schedule-for-owner"
import {
  OwnerBarberScheduleContent,
  type BarberForOwner,
} from "./owner-barber-schedule-view"

type BarberRow = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-barbers").getOwnerBarbers
  >
>[number]

type OwnerBarbersTableProps = {
  barbers: BarberRow[]
  barbershops: { id: string; name: string }[]
}

export function OwnerBarbersTable({
  barbers,
  barbershops,
}: OwnerBarbersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    barberId: string
    name: string
  } | null>(null)
  const [addBarbershopId, setAddBarbershopId] = useState<string>("")
  const [addEmail, setAddEmail] = useState("")
  const [scheduleDialogBarberId, setScheduleDialogBarberId] = useState<
    string | null
  >(null)
  const [scheduleData, setScheduleData] = useState<BarberForOwner | null>(null)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)

  useEffect(() => {
    if (!scheduleDialogBarberId) return
    let cancelled = false
    getBarberScheduleForOwner(scheduleDialogBarberId)
      .then((data) => {
        if (!cancelled && data) setScheduleData(data)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSchedule(false)
      })
    return () => {
      cancelled = true
    }
  }, [scheduleDialogBarberId])

  const handleAdd = () => {
    if (!addBarbershopId || !addEmail.trim()) {
      toast.error("Selecione a barbearia e informe o e-mail")
      return
    }
    startTransition(async () => {
      try {
        await createBarberOwner(addBarbershopId, addEmail.trim())
        toast.success("Barbeiro vinculado com sucesso")
        setAddOpen(false)
        setAddBarbershopId("")
        setAddEmail("")
        router.refresh()
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erro ao vincular barbeiro",
        )
      }
    })
  }

  const handleToggleActive = (barberId: string) => {
    startTransition(async () => {
      try {
        await toggleBarberActiveOwner(barberId)
        toast.success("Status atualizado")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao atualizar")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    startTransition(async () => {
      try {
        await deleteBarberOwner(deleteConfirm.barberId)
        toast.success("Barbeiro removido da barbearia")
        setDeleteConfirm(null)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao remover")
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Gestão de barbeiros</h2>
        <div className="flex items-center gap-2">
          <BarbershopFilter barbershops={barbershops} />
          <Button onClick={() => setAddOpen(true)} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Adicionar barbeiro
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Barbearia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barbers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum barbeiro encontrado. Adicione um barbeiro por e-mail.
                  </TableCell>
                </TableRow>
              ) : (
                barbers.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.user.name ?? "—"}
                    </TableCell>
                    <TableCell>{b.user.email ?? "—"}</TableCell>
                    <TableCell>{b.barbershop.name}</TableCell>
                    <TableCell>
                      <Badge variant={b.isActive ? "default" : "secondary"}>
                        {b.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver agenda"
                          onClick={() => {
                            setScheduleData(null)
                            setIsLoadingSchedule(true)
                            setScheduleDialogBarberId(b.id)
                          }}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={b.isActive ? "Desativar" : "Ativar"}
                          onClick={() => handleToggleActive(b.id)}
                          disabled={isPending}
                        >
                          <UserXIcon className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                setDeleteConfirm({
                                  barberId: b.id,
                                  name: b.user.name ?? "Barbeiro",
                                })
                              }
                            >
                              Excluir da barbearia
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog Adicionar barbeiro */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar barbeiro</DialogTitle>
            <DialogDescription>
              Informe o e-mail do usuário cadastrado. Ele será vinculado como
              barbeiro na barbearia escolhida.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Barbearia</Label>
              <Select
                value={addBarbershopId}
                onValueChange={setAddBarbershopId}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>E-mail do usuário</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleAdd} disabled={isPending}>
              {isPending ? "Salvando…" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Agenda do barbeiro */}
      <Dialog
        open={!!scheduleDialogBarberId}
        onOpenChange={(open) => {
          if (!open) {
            setScheduleDialogBarberId(null)
            setScheduleData(null)
            setIsLoadingSchedule(false)
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {scheduleData
                ? `Agenda — ${scheduleData.user.name ?? "Barbeiro"}`
                : "Agenda"}
            </DialogTitle>
            <DialogDescription>
              {scheduleData?.barbershop.name ?? "Carregando…"}
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
            {isLoadingSchedule ? (
              <div className="flex items-center justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : scheduleData ? (
              <OwnerBarberScheduleContent barber={scheduleData} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar exclusão */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir barbeiro</DialogTitle>
            <DialogDescription>
              Remover {deleteConfirm?.name} da barbearia? O usuário continuará
              existindo no sistema, mas deixará de ser barbeiro nesta barbearia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Removendo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function BarbershopFilter({
  barbershops,
}: {
  barbershops: { id: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const value = searchParams.get("barbershop") ?? "all"

  const setBarbershop = (id: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (id === "all") next.delete("barbershop")
    else next.set("barbershop", id)
    router.push(`/owner/barbers?${next.toString()}`)
  }

  if (barbershops.length <= 1) return null

  return (
    <Select value={value} onValueChange={setBarbershop}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Barbearia" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas</SelectItem>
        {barbershops.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
