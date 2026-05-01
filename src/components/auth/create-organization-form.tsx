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
import { authClient } from "@/src/lib/auth-client"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").trim(),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").trim(),
  logo: z.string().url("Logo deve ser uma URL válida").optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phones: z.array(z.string()).optional(),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
})

export function CreateOrganizationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      description: "",
      address: "",
      phones: [],
      social: {
        facebook: "",
        instagram: "",
      },
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await authClient.organization.create({
        name: values.name,
        slug: values.slug,
        logo: values.logo,
      })
      toast.success("Organização criada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar organização")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <Button disabled={isLoading} type="submit">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Criar Organização"
          )}
        </Button>
      </form>
    </Form>
  )
}
