"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { EntityCombobox } from "@/src/components/entity-combobox"
import {
  createBookingOwner,
  updateBookingOwner,
} from "@/src/features/booking/booking.panel.actions"
import type { OwnerBookingRow } from "@/src/features/booking/booking.types"
import {
  buildAppZonedDateTime,
  formatAppZonedDateParam,
  getZonedDateParts,
  parseAppZonedDateParam,
} from "@/src/shared/lib/timezone-utils"

const WALK_IN_ID = "__walkin__"

const formSchema = z
  .object({
    clientUserId: z.string().min(1, "Selecione um cliente"),
    walkInName: z.string().optional(),
    walkInPhone: z.string().optional(),
    serviceId: z.string().min(1, "Selecione um serviço"),
    memberId: z.string().min(1, "Selecione um barbeiro"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    time: z.string().min(1, "Informe o horário"),
    observations: z.string().optional(),
  })
  .refine(
    (d) =>
      d.clientUserId !== WALK_IN_ID ||
      (Boolean(d.walkInName?.trim()) && Boolean(d.walkInPhone?.trim())),
    { message: "Preencha nome e telefone do cliente", path: ["walkInName"] },
  )

type FormValues = z.infer<typeof formSchema>

function timeFromDate(date: Date | string) {
  const parts = getZonedDateParts(new Date(date))
  return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`
}

export function BookingFormDialog({
  open,
  onOpenChange,
  clients,
  services,
  barbers,
  initial,
  defaultDate,
  defaultMemberId,
  pending,
  startTransition,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: { id: string; name: string }[]
  services: { id: string; name: string }[]
  barbers: { id: string; name: string }[]
  initial: OwnerBookingRow | null
  defaultDate: string
  defaultMemberId: string
  pending: boolean
  startTransition: (fn: () => void) => void
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientUserId: initial?.userId ?? clients[0]?.id ?? "",
      walkInName: "",
      walkInPhone: "",
      serviceId: initial?.serviceId ?? services[0]?.id ?? "",
      memberId: initial?.memberId ?? defaultMemberId ?? barbers[0]?.id ?? "",
      date: initial
        ? formatAppZonedDateParam(new Date(initial.date))
        : defaultDate,
      time: initial ? timeFromDate(initial.date) : "09:00",
      observations: initial?.observations ?? "",
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      clientUserId: initial?.userId ?? clients[0]?.id ?? "",
      walkInName: "",
      walkInPhone: "",
      serviceId: initial?.serviceId ?? services[0]?.id ?? "",
      memberId: initial?.memberId ?? defaultMemberId ?? barbers[0]?.id ?? "",
      date: initial
        ? formatAppZonedDateParam(new Date(initial.date))
        : defaultDate,
      time: initial ? timeFromDate(initial.date) : "09:00",
      observations: initial?.observations ?? "",
    })
  }, [open, initial, clients, services, barbers, defaultDate, defaultMemberId, form])

  const clientId = form.watch("clientUserId")

  function onSubmit(data: FormValues) {
    const day = parseAppZonedDateParam(data.date)
    if (!day) {
      toast.error("Data inválida")
      return
    }
    const date = buildAppZonedDateTime(day, data.time)

    startTransition(async () => {
      try {
        if (initial) {
          await updateBookingOwner({
            bookingId: initial.id,
            serviceId: data.serviceId,
            memberId: data.memberId,
            date,
            observations: data.observations,
          })
          toast.success("Agendamento atualizado")
        } else {
          await createBookingOwner({
            clientUserId:
              data.clientUserId === WALK_IN_ID ? undefined : data.clientUserId,
            walkInName:
              data.clientUserId === WALK_IN_ID ? data.walkInName : undefined,
            walkInPhone:
              data.clientUserId === WALK_IN_ID ? data.walkInPhone : undefined,
            serviceId: data.serviceId,
            memberId: data.memberId,
            date,
            observations: data.observations,
          })
          toast.success("Agendamento criado")
        }
        onOpenChange(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="panel-booking-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3"
          >
            {!initial ? (
              <FormField
                control={form.control}
                name="clientUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <EntityCombobox
                        options={clients}
                        extraOption={{ id: WALK_IN_ID, name: "Novo cliente" }}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Pesquisar cliente…"
                        emptyText="Nenhum cliente encontrado"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {clientId === WALK_IN_ID && !initial ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="walkInName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do cliente" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="walkInPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="11999998888" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barbeiro *</FormLabel>
                  <FormControl>
                    <EntityCombobox
                      options={barbers}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione…"
                      emptyText="Nenhum barbeiro encontrado"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço *</FormLabel>
                  <FormControl>
                    <EntityCombobox
                      options={services}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione…"
                      emptyText="Nenhum serviço encontrado"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário *</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opcional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="panel-booking-form" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
