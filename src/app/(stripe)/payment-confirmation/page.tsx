import { redirect } from "next/navigation"
import Link from "next/link"

import { stripe } from "@/src/lib/stripe"
import { PATHS } from "@/src/constants/PATHS"
import { HomeIcon, ShoppingBag } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card"

interface ReturnProps {
  searchParams: Promise<{ session_id: string }>
}

export default async function Return({ searchParams }: ReturnProps) {
  const { session_id } = await searchParams

  if (!session_id)
    throw new Error("Session ID is required to complete the payment.")

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  })
  const { status } = session
  const customerEmail = session.customer_details?.email ?? null

  if (status === "open") {
    return redirect(PATHS.PANEL.ROOT)
  }

  if (status === "expired") {
    return (
      <section id="expired">
        <p>A sessão de pagamento expirou. Por favor, tente novamente.</p>
        <Button asChild>
          <Link href={PATHS.ROOT}>Voltar para a página de checkout</Link>
        </Button>
      </section>
    )
  }

  if (status === "complete") {
    return (
      <>
        <Card className="text-center">
          <CardContent>
            <CardHeader>
              <ShoppingBag className="mx-auto h-10 w-10 text-green-500" />
              <CardTitle>Assinatura confirmada</CardTitle>
              <CardDescription>
                Obrigado por assinar nosso serviço.
              </CardDescription>
            </CardHeader>
            <div>
              <p>Sua assinatura foi processada com sucesso e está ativa.</p>
              <p>Você pode acessar o painel do proprietário agora.</p>
              {customerEmail && (
                <p className="pt-3 text-sm text-muted-foreground">
                  Um email de confirmação será enviado para {customerEmail}.
                </p>
              )}
            </div>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href={PATHS.PANEL.ROOT}>
                  <HomeIcon />
                  Acessar o painel do proprietário
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }
}
