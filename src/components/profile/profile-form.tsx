"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import z from "zod"

import {
  changeProfileEmail,
  updateProfile,
  uploadProfileAvatar,
} from "@/src/features/user/user.actions"
import type { ClientProfile } from "@/src/features/user/user.types"
import { PATHS } from "@/src/shared/constants/PATHS"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"

const profileFormSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.union([
    z.string().trim().min(8, "Informe um telefone válido"),
    z.literal(""),
  ]),
})

const changeEmailFormSchema = z.object({
  currentEmail: z.string(),
  newEmail: z.string().trim().email("E-mail inválido"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type ChangeEmailFormValues = z.infer<typeof changeEmailFormSchema>

type ProfileFormProps = {
  profile: ClientProfile
  callbackPath?: string
}

export function ProfileForm({
  profile,
  callbackPath = PATHS.PROFILE.ROOT,
}: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isUploadingAvatar, startAvatarUpload] = useTransition()
  const [isChangingEmail, startEmailChange] = useTransition()
  const [previewImage, setPreviewImage] = useState(profile.image ?? "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
    },
  })

  const emailForm = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailFormSchema),
    defaultValues: {
      currentEmail: profile.email ?? "",
      newEmail: "",
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateProfile({
        name: values.name,
        phone: values.phone,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Perfil atualizado com sucesso")
      router.refresh()
    })
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    startAvatarUpload(async () => {
      const result = await uploadProfileAvatar(formData)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setPreviewImage(result.imageUrl)
      toast.success("Foto atualizada com sucesso")
      router.refresh()
    })

    event.target.value = ""
  }

  const onChangeEmail = (values: ChangeEmailFormValues) => {
    startEmailChange(async () => {
      const result = await changeProfileEmail({
        newEmail: values.newEmail,
        callbackPath,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(result.message)
      emailForm.reset({
        currentEmail: profile.email ?? "",
        newEmail: "",
      })
    })
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={previewImage} alt={profile.name} />
                <AvatarFallback>
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                {isUploadingAvatar ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </span>
            </button>

            <div>
              <p className="font-medium">{profile.name}</p>
              <p className="text-sm text-muted-foreground">
                Toque na foto para enviar uma imagem (máx. 5 MB)
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Alterar foto"
                )}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="grid max-w-md gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Seu nome completo" />
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
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4 border-t pt-6">
        <div>
          <h2 className="text-base font-semibold">E-mail</h2>
          <p className="text-sm text-muted-foreground">
            Enviaremos um link de verificação para o novo endereço.
          </p>
        </div>

        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onChangeEmail)}
            className="space-y-4"
          >
            <div className="grid max-w-md gap-2">
              <FormField
                control={emailForm.control}
                name="currentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail atual</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo e-mail</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="novo@email.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" variant="outline" disabled={isChangingEmail}>
              {isChangingEmail ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Alterar e-mail"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
