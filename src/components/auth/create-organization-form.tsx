"use client"

import z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createOrganizationWithProfile } from "@/src/server/organizations/create-organization-with-profile"
import { PATHS } from "@/src/constants/PATHS"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").trim(),
  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug só pode conter letras minúsculas, números e hífens",
    )
    .trim(),
  logo: z.union([z.string().url("Logo deve ser uma URL válida"), z.literal("")]).optional(),
  description: z.string().trim().optional(),
  address: z.string().trim().min(1, "Morada é obrigatória"),
  phone: z.string().trim().min(8, "Informe um telefone válido"),
})

export function CreateOrganizationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      description: "",
      address: "",
      phone: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const result = await createOrganizationWithProfile({
        name: values.name,
        slug: values.slug,
        logo: values.logo,
        description: values.description ?? "",
        address: values.address,
        phones: [values.phone],
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Barbearia criada com sucesso")
      router.push(PATHS.PANEL.ROOT)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar barbearia")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome da Barbearia" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="nome-da-barbearia" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Morada</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Rua, número, cidade" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="(11) 99999-9999" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder="Sobre a barbearia"
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo (URL)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading} type="submit">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Criar barbearia"
          )}
        </Button>
      </form>
    </Form>
  )
}
