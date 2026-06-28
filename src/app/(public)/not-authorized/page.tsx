import Header from "@/src/components/layout/header"
import Link from "next/link"
import { PATHS } from "@/src/shared/constants/PATHS"
import { Button } from "@/src/components/ui/button"

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-8">
        <div className="max-w-md rounded-lg border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold">Sem acesso ao painel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta não tem permissão para acessar o painel interno. O painel
            é destinado a donos, gestores e barbeiros da barbearia.
          </p>
          <Button asChild className="mt-6">
            <Link href={PATHS.ROOT}>Voltar à página inicial</Link>
          </Button>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-4">
              <Link
                href="/dev"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                Dev: vincular-se como dono de uma barbearia
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
