"use client"

import Image from "next/image"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
import { Calendar } from "../ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { set } from "date-fns"
import { useSession } from "@/src/shared/lib/auth-client"
import { toast } from "sonner"
import { Dialog, DialogContent } from "../ui/dialog"
import SignInDialog from "../auth/sign-in-dialog"
import BookingSummary from "../booking/booking-summary"
import { useRouter } from "next/navigation"
import { getBookings } from "@/src/features/booking/booking.actions"
import { createBooking } from "@/src/features/booking/booking.actions"
import type { ServiceDayBooking } from "@/src/features/booking/booking.types"
import type {
  PublicBarberForBooking,
  PublicOrganizationForBooking,
  PublicServiceForBooking,
} from "@/src/features/public/public.types"
import {
  generateTimeSlots,
  filterAvailableTimes,
  filterTimesByBreaks,
  filterTimesByBlockedSlots,
  getDayOfWeek,
  type DaySchedule,
} from "@/src/shared/lib/schedule-utils"

interface ServiceItemProps {
  service: PublicServiceForBooking
  organization: PublicOrganizationForBooking
  barbers: PublicBarberForBooking[]
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

const ServiceItem = ({ service, organization, barbers }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [selectedBarberId, setSelectedBarberId] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<ServiceDayBooking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
        memberId: selectedBarberId,
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id, selectedBarberId])

  const selectedBarber = useMemo(() => {
    if (!selectedBarberId) return undefined
    const barber = barbers.find((barber) => barber.id === selectedBarberId)
    if (!barber) return undefined
    return {
      name: barber.user.name,
    }
  }, [barbers, selectedBarberId])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime?.split(":")[0]),
      minutes: Number(selectedTime?.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDay(undefined)
      setSelectedTime(undefined)
      setSelectedBarberId(undefined)
      setDayBookings([])
    }
    setBookingSheetIsOpen(open)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    setSelectedTime(undefined)
    setSelectedBarberId(
      date && barbers.length === 1 ? barbers[0]?.id : undefined,
    )
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarberId(barberId)
    setSelectedTime(undefined)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate || !selectedBarberId) return
      await createBooking({
        serviceId: service.id,
        memberId: selectedBarberId,
        date: selectedDate,
      })
      handleBookingSheetOpenChange(false)
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay || !selectedBarberId) return []

    const dayOfWeek = getDayOfWeek(selectedDay)
    const selectedBarber = barbers.find((b) => b.id === selectedBarberId)
    if (!selectedBarber) return []

    const barberSchedule = selectedBarber.schedules.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isActive,
    )
    const shopSchedule = organization.schedules.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isActive,
    )
    const schedule: DaySchedule | null =
      selectedBarber.schedules.length > 0
        ? (barberSchedule ?? null)
        : (shopSchedule ?? null)

    if (!schedule) return []

    let timeSlots = generateTimeSlots(schedule, 30)

    const shopBreaksForDay = organization.breaks.filter(
      (b) => b.dayOfWeek === dayOfWeek,
    )
    timeSlots = filterTimesByBreaks(
      timeSlots,
      shopBreaksForDay.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      })),
    )

    const breaksForDay = selectedBarber.breaks.filter(
      (b) => b.dayOfWeek === dayOfWeek,
    )
    timeSlots = filterTimesByBreaks(
      timeSlots,
      breaksForDay.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
    )

    timeSlots = filterTimesByBlockedSlots(
      timeSlots,
      selectedDay,
      organization.blockedSlots.map((s) => ({
        startAt: toDate(s.startAt),
        endAt: toDate(s.endAt),
      })),
    )

    timeSlots = filterTimesByBlockedSlots(
      timeSlots,
      selectedDay,
      selectedBarber.blockedSlots.map((s) => ({
        startAt: toDate(s.startAt),
        endAt: toDate(s.endAt),
      })),
    )

    const barberBookings = dayBookings
      .filter((b) => b.memberId === selectedBarberId)
      .map((booking) => ({ date: toDate(booking.date) }))

    return filterAvailableTimes(timeSlots, barberBookings, selectedDay)
  }, [
    dayBookings,
    selectedDay,
    selectedBarberId,
    organization.schedules,
    organization.breaks,
    organization.blockedSlots,
    barbers,
  ])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
              sizes="100dvw"
            />
          </div>

          <div className="flex flex-1 flex-col gap-2 space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>

            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(service.price)}
              </p>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleBookingClick}
              >
                Reservar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={bookingSheetIsOpen}
        onOpenChange={handleBookingSheetOpenChange}
      >
        <SheetContent className="hide-scrollbar flex w-[85%] flex-col gap-0 overflow-y-auto px-0 sm:max-w-md">
          <SheetHeader className="px-5 pt-2">
            <SheetTitle className="text-center">Fazer Reserva</SheetTitle>
          </SheetHeader>

          <div className="flex justify-center border-b border-solid px-3 py-4">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selectedDay}
              onSelect={handleDateSelect}
              fromDate={new Date()}
            />
          </div>

          {selectedDay && barbers.length === 0 && (
            <div className="border-b border-solid p-5">
              <p className="text-sm text-muted-foreground">
                Nenhum barbeiro disponível nesta barbearia no momento.
              </p>
            </div>
          )}

          {selectedDay && barbers.length > 0 && (
            <div className="space-y-3 border-b border-solid p-5">
              <h3 className="text-xs font-bold uppercase text-gray-400">
                Barbeiro
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {barbers.map((barber) => (
                  <Button
                    key={barber.id}
                    variant={
                      selectedBarberId === barber.id ? "default" : "outline"
                    }
                    className="rounded-full"
                    onClick={() => handleBarberSelect(barber.id)}
                  >
                    {barber.user.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedDay && selectedBarberId && (
            <div className="space-y-3 border-b border-solid p-5">
              <h3 className="text-xs font-bold uppercase text-gray-400">
                Horário
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {timeList.length > 0 ? (
                  timeList.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Não há horários disponíveis para este dia.
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedDate && selectedBarberId && (
            <div className="p-5">
              <BookingSummary
                organization={organization}
                service={service}
                selectedDate={selectedDate}
                barber={selectedBarber}
              />
            </div>
          )}

          <SheetFooter className="mt-auto px-5 pb-5">
            <Button
              className="w-full"
              onClick={handleCreateBooking}
              disabled={!selectedDay || !selectedTime || !selectedBarberId}
            >
              Confirmar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
