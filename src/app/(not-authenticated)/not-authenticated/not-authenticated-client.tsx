"use client"

import Header from "@/src/components/layout/header"
import { Button } from "@/src/components/ui/button"
import { PATHS } from "@/src/constants/PATHS"
import Link from "next/link"
import { LogIn } from "lucide-react"
import SignInDialog from "@/src/components/auth/sign-in-dialog"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import { useState } from "react"

export function NotAuthenticatedClient({
  callbackUrl,
}: {
  callbackUrl: string
}) {
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm md:max-w-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <LogIn className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-lg font-semibold">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Você precisa estar autenticado para acessar esta página. Faça
              login com sua conta para continuar.
            </p>
            <Button
              className="mt-6"
              onClick={() => setSignInDialogIsOpen(true)}
            >
              Fazer login
            </Button>
            <p className="mt-4">
              <Link
                href={PATHS.HOME}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Voltar para a página inicial
              </Link>
            </p>
          </div>
        </main>
      </div>
      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog callbackUrl={callbackUrl} />
        </DialogContent>
      </Dialog>
    </>
  )
}
