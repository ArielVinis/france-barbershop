import { redirect } from "next/navigation"
import { getCurrentUser } from "@/src/server/auth/users"
import { db } from "@/src/lib/prisma"
import Header from "@/src/components/layout/header"
import { DevPanelForm } from "./panel/dev-panel-form"

/**
 * Página de desenvolvimento: vincular o usuário logado como OWNER a uma barbearia.
 * Só renderiza quando NODE_ENV === "development".
 */
export default async function DevPage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/")
  }

  const { user } = await getCurrentUser()

  const barbershops = await db.organization.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-md px-5 py-8">
        <div className="rounded-lg border bg-card p-6">
          <h1 className="text-lg font-semibold">
            Dev: Tornar-me dono da barbearia
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define seu usuário como OWNER e vincula a uma barbearia. Só funciona
            em desenvolvimento.
          </p>
          <DevPanelForm
            user={{ name: user.name, email: user.email, role: user.role }}
            barbershops={barbershops}
          />
        </div>
      </main>
    </div>
  )
}
