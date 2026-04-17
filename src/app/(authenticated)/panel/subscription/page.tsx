import { getCurrentUser } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { BarberSubscriptionPanel } from "@/src/app/(authenticated)/panel/subscription/barber-subscription-panel"
import {
  fetchSubscriptionByEmail,
  isOwnerSubscriptionAllowed,
  translateSubscriptionInterval,
  translateSubscriptionStatus,
} from "@/src/app/(stripe)/_features/_actions/fetch-subscription-by-email"
import { cancelSubscription } from "@/src/app/(stripe)/_features/_actions/cancel-subscription"
import Checkout from "@/src/app/(stripe)/_components/checkout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"

function formatCurrency(amount: number | null | undefined, currency = "brl") {
  if (amount == null) return "-"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function formatDate(value: number | null | undefined) {
  if (!value) return "-"
  return new Date(value * 1000).toLocaleDateString("pt-BR")
}

export default async function OwnerSubscriptionPage() {
  const user = await getCurrentUser()
  if (user.role === "BARBER") {
    return <BarberSubscriptionPanel />
  }

  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null

  const subscription = await fetchSubscriptionByEmail(owner.user.email ?? "")
  const item = subscription?.items.data[0]
  const price = item?.price
  const isPaid = await isOwnerSubscriptionAllowed(subscription?.status)
  const customerPortalUrl = process.env.STRIPE_CUSTOMER_PORTAL_URL

  async function handleCancelSubscription(formData: FormData) {
    "use server"
    const subscriptionId = formData.get("subscriptionId")?.toString()
    if (!subscriptionId) return
    await cancelSubscription(subscriptionId)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="grid gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Minha assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Plano:</strong>{" "}
                {isPaid ? (price?.nickname ?? "Plano Pro") : "-"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {subscription
                  ? translateSubscriptionStatus(subscription.status)
                  : "Sem assinatura"}
              </p>
              <p>
                <strong>Próxima cobrança:</strong>{" "}
                {formatDate(item?.current_period_end ?? null)}
              </p>
              <p>
                <strong>Valor:</strong>{" "}
                {formatCurrency(price?.unit_amount, price?.currency)}
              </p>
              <p>
                <strong>Ciclo:</strong>{" "}
                {price?.recurring?.interval
                  ? translateSubscriptionInterval(price.recurring.interval)
                  : "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações da assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPaid ? (
                <Button
                  asChild
                  className="w-full"
                  type="button"
                  variant="outline"
                  disabled={!customerPortalUrl}
                >
                  <a
                    href={customerPortalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Atualizar método de pagamento
                  </a>
                </Button>
              ) : (
                <Checkout>
                  <Button className="w-full" type="button" variant="secondary">
                    Assinar agora
                  </Button>
                </Checkout>
              )}

              <form action={handleCancelSubscription}>
                <input
                  type="hidden"
                  name="subscriptionId"
                  value={subscription?.id ?? ""}
                />
                <Button
                  variant="destructive"
                  className="w-full"
                  type="submit"
                  disabled={!subscription || !isPaid}
                >
                  Cancelar assinatura
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
