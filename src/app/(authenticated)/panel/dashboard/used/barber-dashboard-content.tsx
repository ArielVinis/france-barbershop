import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { PATHS } from "@/src/constants/PATHS"

type BookingPreview = {
  id: string
  date: Date
  user: { name: string }
  service: { name: string }
}

type BarberDashboardContentProps = {
  barberName: string
  barbershopName: string
  weekBookings: BookingPreview[]
}

export function BarberDashboardContent({
  barberName,
  barbershopName,
  weekBookings,
}: BarberDashboardContentProps) {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-xl font-semibold">Olá, {barberName}</h1>
        <p className="text-sm text-muted-foreground">{barbershopName}</p>
      </div>

      <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Esta semana</CardTitle>
            <CardDescription>
              Seus agendamentos no período atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {weekBookings.length}
            </p>
            <p className="text-sm text-muted-foreground">agendamentos</p>
            <Button className="mt-4" variant="secondary" asChild>
              <Link href={PATHS.PANEL.SCHEDULE}>Ver agenda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {weekBookings.length > 0 && (
        <div className="px-4 lg:px-6">
          <h2 className="mb-2 text-lg font-semibold">Próximos na semana</h2>
          <ul className="space-y-2 rounded-lg border p-3">
            {weekBookings.slice(0, 8).map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
              >
                <span className="font-medium">{b.user.name}</span>
                <span className="text-muted-foreground">{b.service.name}</span>
                <span className="text-muted-foreground">
                  {format(b.date, "EEE dd/MM HH:mm", { locale: ptBR })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
