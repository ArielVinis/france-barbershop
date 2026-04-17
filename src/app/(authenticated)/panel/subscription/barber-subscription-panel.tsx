import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/src/lib/auth"
import { getBarberForUser } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { hasBarbershopSubscriptionAccess } from "@/src/features/owner/_data/get-barbershop-subscription-access"
import { PATHS } from "@/src/constants/PATHS"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export async function BarberSubscriptionPanel() {
  const user = await getCurrentUser()
  const barber = await getBarberForUser(user.id)
  if (!barber) return null

  const hasAccess = await hasBarbershopSubscriptionAccess(barber.barbershopId)
  if (hasAccess) {
    redirect(PATHS.PANEL.ROOT)
  }

  const shop = await db.barbershop.findUnique({
    where: { id: barber.barbershopId },
    select: { name: true },
  })

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Assinatura inativa</CardTitle>
            {shop?.name ? (
              <CardDescription>Barbearia: {shop.name}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              O pagamento do plano desta barbearia está expirado ou inativo.
              Após o dono regularizar a assinatura, você voltará a ter acesso ao
              painel de gestão.
            </p>
            <Button asChild variant="outline">
              <Link href={PATHS.PANEL.ROOT}>Voltar ao início do painel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
