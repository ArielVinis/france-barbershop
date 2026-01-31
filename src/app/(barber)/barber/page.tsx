import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { CalendarDays, CalendarRange, User } from "lucide-react"

export default function BarberDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel do Barbeiro</h1>
        <p className="text-muted-foreground">
          Gerencie seus agendamentos, agenda e perfil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meus agendamentos
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Veja e gerencie os agendamentos do dia e da semana.
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/barber/bookings">Abrir</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minha agenda</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Configure dias de trabalho, horários e pausas.
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/barber/agenda">Abrir</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meu perfil</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Serviços, foto, bio e disponibilidade.
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/barber/perfil">Abrir</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
