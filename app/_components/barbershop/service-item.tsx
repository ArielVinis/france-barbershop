"use client"

import {
  Barbershop,
  BarbershopService,
  Booking,
  BarbershopSchedule,
} from "@prisma/client"
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
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "../ui/dialog"
import SignInDialog from "../auth/sign-in-dialog"
import BookingSummary from "../booking/booking-summary"
import { useRouter } from "next/navigation"
import { getBookings } from "../../_features/bookings/_actions/get-bookings"
import { createBooking } from "../../_features/bookings/_actions/create-booking"
import {
  generateTimeSlots,
  filterAvailableTimes,
  getDayOfWeek,
} from "../../_lib/schedule-utils"

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, "name"> & { schedules: BarbershopSchedule[] }
  barbers: Array<{
    id: string
    user: {
      name: string
    }
  }>
}

const ServiceItem = ({ service, barbershop, barbers }: ServiceItemProps) => {
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
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id])

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

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setSelectedBarberId(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarberId(barberId)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      await createBooking({
        serviceId: service.id,
        barberId: selectedBarberId,
        date: selectedDate,
      })
      handleBookingSheetOpenChange()
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
    if (!selectedDay) return []

    const dayOfWeek = getDayOfWeek(selectedDay)

    const schedule = barbershop.schedules.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isActive,
    )

    if (!schedule) return []

    const timeSlots = generateTimeSlots(schedule, 30)

    return filterAvailableTimes(timeSlots, dayBookings, selectedDay)
  }, [dayBookings, selectedDay, barbershop.schedules])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* IMAGE */}
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          {/* DIREITA */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
            {/* PREÇO E BOTÃO */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>

              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="hide-scrollbar overflow-y-auto px-0">
                  <SheetHeader>
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  <div className="border-b border-solid py-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={handleDateSelect}
                      fromDate={new Date()}
                      styles={{
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {barbers.length > 0 && selectedDay && (
                    <div className="hide-scrollbar flex gap-3 overflow-x-auto border-b border-solid p-5">
                      {barbers.map((barber) => (
                        <Button
                          key={barber.id}
                          variant={
                            selectedBarberId === barber.id
                              ? "default"
                              : "outline"
                          }
                          className="rounded-full"
                          onClick={() => handleBarberSelect(barber.id)}
                        >
                          {barber.user.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {selectedDay && selectedBarberId && (
                    <div className="hide-scrollbar flex gap-3 overflow-x-auto border-b border-solid p-5">
                      {timeList.length > 0 ? (
                        timeList.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className="rounded-full"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-xs">
                          Não há horários disponíveis para este dia.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDate && selectedBarberId && (
                    <div className="p-5">
                      <BookingSummary
                        barbershop={barbershop}
                        service={service}
                        selectedDate={selectedDate}
                        barber={selectedBarber}
                      />
                    </div>
                  )}
                  <SheetFooter className="mt-5 px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime}
                    >
                      Confirmar
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

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
