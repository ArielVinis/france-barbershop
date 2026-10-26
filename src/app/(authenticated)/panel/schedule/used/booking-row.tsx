"use client"

import { Check, ChevronDown } from "lucide-react"
import type { BookingStatus } from "@/prisma/generated/prisma/client"
import type { OwnerBookingRow } from "@/src/features/booking/booking.types"
import { BOOKING_STATUS_LABEL } from "@/src/features/booking/booking.types"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { getZonedDateParts } from "@/src/shared/lib/timezone-utils"

const NEXT_STATUS: Record<string, BookingStatus[]> = {
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["FINISHED", "CANCELLED", "NO_SHOW"],
}

function formatTime(date: Date | string) {
  const parts = getZonedDateParts(new Date(date))
  return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`
}

export function BookingRow({
  booking,
  pending,
  onEdit,
  onStatus,
}: {
  booking: OwnerBookingRow
  pending: boolean
  onEdit: (b: OwnerBookingRow) => void
  onStatus: (id: string, status: BookingStatus) => void
}) {
  const next = NEXT_STATUS[booking.status] ?? []

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5">
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onEdit(booking)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{formatTime(booking.date)}</span>
          <span className="text-xs text-muted-foreground">
            {booking.service.durationMinutes} min
          </span>
          <Badge variant="outline">
            {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
          </Badge>
        </div>
        <p className="mt-0.5 font-medium">
          <span className="font-normal text-muted-foreground">
            {booking.member?.user.name ?? "Barbeiro"}
            {" · "}
          </span>
          {booking.user.name ?? "Cliente"}
        </p>
        <p className="text-xs text-muted-foreground">{booking.service.name}</p>
      </button>
      {next.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" variant="outline" disabled={pending}>
              Status
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {next.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatus(booking.id, status)}
              >
                <Check className="size-4" />
                {BOOKING_STATUS_LABEL[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  )
}
