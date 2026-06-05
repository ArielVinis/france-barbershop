"use client"

import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import Link from "next/link"
import { PATHS } from "@/src/constants/PATHS"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form"
import { toast } from "sonner"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { authClient } from "@/src/lib/auth-client"

const formSchema = z.object({
  email: z.string().email("Email inválido").trim(),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: PATHS.AUTH.RESET_PASSWORD,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Link de redefinição enviado com sucesso")
        router.push(PATHS.AUTH.LOGIN)
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Digite seu e-mail para receber o link de redefinição
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de e-mail</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joao@example.com"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Se o e-mail existir, enviaremos as instruções para redefinir sua
            senha.
          </p>
        </div>
        <div className="grid gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Enviar link de redefinição"
            )}
          </Button>
        </div>
        <div className="text-center text-sm">
          Lembrou da senha?{" "}
          <Link
            href={PATHS.AUTH.LOGIN}
            className="underline underline-offset-4"
          >
            Voltar para login
          </Link>
        </div>
      </form>
    </Form>
  )
}
