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
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/src/lib/auth-client"

const formSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .trim(),
  confirmPassword: z.string().min(8).trim(),
})

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") as string

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true)

    if (data.newPassword !== data.confirmPassword) {
      toast.error("As senhas não conferem")
      setIsPending(false)
      return
    }

    const { error } = await authClient.resetPassword({
      newPassword: data.newPassword,
      token,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Senha redefinida com sucesso")
      router.push(PATHS.AUTH.LOGIN)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Redefinir senha</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Digite sua nova senha
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="********"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Redefinir senha"
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
