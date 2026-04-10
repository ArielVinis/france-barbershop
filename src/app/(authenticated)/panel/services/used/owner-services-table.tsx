"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
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
import { createServiceOwner } from "@/src/features/owner/_actions/create-service-owner"
import { updateServiceOwner } from "@/src/features/owner/_actions/update-service-owner"
import { deleteServiceOwner } from "@/src/features/owner/_actions/delete-service-owner"

type ServiceRow = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-services").getOwnerServices
  >
>[number]

type OwnerServicesTableProps = {
  services: ServiceRow[]
  barbershops: { id: string; name: string }[]
}

const DEFAULT_IMAGE =
  "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png"

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function OwnerServicesTable({
  services,
  barbershops,
}: OwnerServicesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [editService, setEditService] = useState<ServiceRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    serviceId: string
    name: string
  } | null>(null)

  const [addForm, setAddForm] = useState({
    barbershopId: "",
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    durationMinutes: "",
  })
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    durationMinutes: "",
  })

  const handleAdd = () => {
    if (!addForm.barbershopId || !addForm.name.trim()) {
      toast.error("Selecione a barbearia e informe o nome do serviço")
      return
    }
    const price = parseFloat(addForm.price.replace(",", "."))
    const duration = parseInt(addForm.durationMinutes, 10)
    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido")
      return
    }
    if (isNaN(duration) || duration < 1) {
      toast.error("Duração mínima: 1 minuto")
      return
    }
    startTransition(async () => {
      try {
        await createServiceOwner({
          barbershopId: addForm.barbershopId,
          name: addForm.name.trim(),
          description: addForm.description.trim(),
          imageUrl: addForm.imageUrl.trim() || DEFAULT_IMAGE,
          price,
          durationMinutes: duration,
        })
        toast.success("Serviço criado")
        setAddOpen(false)
        setAddForm({
          barbershopId: "",
          name: "",
          description: "",
          imageUrl: "",
          price: "",
          durationMinutes: "",
        })
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao criar serviço")
      }
    })
  }

  const openEdit = (s: ServiceRow) => {
    setEditService(s)
    setEditForm({
      name: s.name,
      description: s.description,
      imageUrl: s.imageUrl,
      price: String(Number(s.price)),
      durationMinutes: String(s.durationMinutes),
    })
  }

  const handleEdit = () => {
    if (!editService) return
    if (!editForm.name.trim()) {
      toast.error("Nome do serviço é obrigatório")
      return
    }
    const price = parseFloat(editForm.price.replace(",", "."))
    const duration = parseInt(editForm.durationMinutes, 10)
    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido")
      return
    }
    if (isNaN(duration) || duration < 1) {
      toast.error("Duração mínima: 1 minuto")
      return
    }
    startTransition(async () => {
      try {
        await updateServiceOwner({
          serviceId: editService.id,
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          imageUrl: editForm.imageUrl.trim() || undefined,
          price,
          durationMinutes: duration,
        })
        toast.success("Serviço atualizado")
        setEditService(null)
        router.refresh()
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erro ao atualizar serviço",
        )
      }
    })
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    startTransition(async () => {
      try {
        await deleteServiceOwner(deleteConfirm.serviceId)
        toast.success("Serviço excluído")
        setDeleteConfirm(null)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao excluir")
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Gestão de serviços</h2>
        <div className="flex items-center gap-2">
          <BarbershopFilter barbershops={barbershops} />
          <Button onClick={() => setAddOpen(true)} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Adicionar serviço
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="max-w-[200px]">Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Barbearia</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum serviço encontrado. Adicione um serviço para a
                    barbearia.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {s.description || "—"}
                    </TableCell>
                    <TableCell>{formatPrice(Number(s.price))}</TableCell>
                    <TableCell>{s.durationMinutes} min</TableCell>
                    <TableCell>{s.barbershop.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => openEdit(s)}
                          disabled={isPending}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                setDeleteConfirm({
                                  serviceId: s.id,
                                  name: s.name,
                                })
                              }
                            >
                              Excluir serviço
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

      {/* Dialog Adicionar */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar serviço</DialogTitle>
            <DialogDescription>
              Crie um serviço que a barbearia oferece. Defina nome, preço e
              tempo médio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Barbearia</Label>
              <Select
                value={addForm.barbershopId}
                onValueChange={(v) =>
                  setAddForm((p) => ({ ...p, barbershopId: v }))
                }
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
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Corte de cabelo"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Breve descrição do serviço"
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL da imagem (opcional)</Label>
              <Input
                placeholder="https://..."
                value={addForm.imageUrl}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, imageUrl: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={addForm.price}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  value={addForm.durationMinutes}
                  onChange={(e) =>
                    setAddForm((p) => ({
                      ...p,
                      durationMinutes: e.target.value,
                    }))
                  }
                />
              </div>
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

      {/* Dialog Editar */}
      <Dialog open={!!editService} onOpenChange={() => setEditService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar serviço</DialogTitle>
            <DialogDescription>
              Altere nome, descrição, preço ou tempo médio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Corte de cabelo"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Breve descrição"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL da imagem (opcional)</Label>
              <Input
                placeholder="https://..."
                value={editForm.imageUrl}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, imageUrl: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  value={editForm.durationMinutes}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      durationMinutes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar exclusão */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
            <DialogDescription>
              Excluir &quot;{deleteConfirm?.name}&quot;? Não é possível excluir
              se houver agendamentos vinculados.
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
              {isPending ? "Excluindo…" : "Excluir"}
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
    router.push(`/owner/services?${next.toString()}`)
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
