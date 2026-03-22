"use client"

import { BarberHeader } from "./barber-header"

type BarberLayoutClientProps = {
  children: React.ReactNode
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershop: {
    name: string
    slug: string
    imageUrl: string
    schedules: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }>
  }
}

export function BarberLayoutClient({
  children,
  user,
  barbershop,
}: BarberLayoutClientProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <BarberHeader user={user} barbershop={barbershop} />
      <main className="min-h-0 flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  )
}
