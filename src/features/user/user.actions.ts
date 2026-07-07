"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { compressAvatar } from "@/src/features/user/_lib/compress-avatar"
import { saveAvatarFile } from "@/src/features/user/_lib/avatar-storage"
import { userRepository } from "@/src/features/user/user.repository"
import { userService } from "@/src/features/user/user.service"
import {
  ChangeEmailSchema,
  UpdateProfileSchema,
  type ChangeEmailInput,
  type ChangeEmailResult,
  type UpdateProfileInput,
  type UpdateProfileResult,
  type UploadAvatarResult,
} from "@/src/features/user/user.schema"
import { auth } from "@/src/shared/lib/auth"
import { PATHS } from "@/src/shared/constants/PATHS"
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
} from "@/src/shared/constants/uploads"

const baseUrl = process.env.BETTER_AUTH_URL as string

function revalidateProfilePaths() {
  revalidatePath(PATHS.PROFILE.ROOT)
  revalidatePath(PATHS.PANEL.PROFILE)
  revalidatePath(PATHS.ROOT)
  revalidatePath(PATHS.BOOKINGS.ROOT)
  revalidatePath(PATHS.PANEL.ROOT)
}

export async function getUserProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  return userService.getProfile(session.user.id)
}

export async function uploadProfileAvatar(
  formData: FormData,
): Promise<UploadAvatarResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { success: false, error: "Selecione uma imagem válida" }
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: "Formato inválido. Use JPG, PNG, WEBP ou GIF.",
    }
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      success: false,
      error: "A imagem deve ter no máximo 5 MB.",
    }
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const compressedBuffer = await compressAvatar(inputBuffer)
    const imageUrl = await saveAvatarFile(session.user.id, compressedBuffer)

    await auth.api.updateUser({
      body: { image: imageUrl },
      headers: await headers(),
    })

    revalidateProfilePaths()

    return { success: true, imageUrl: `${imageUrl}?v=${Date.now()}` }
  } catch (error) {
    console.error("uploadProfileAvatar", error)
    return {
      success: false,
      error: "Não foi possível enviar a foto. Tente novamente.",
    }
  }
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  const phoneValidation = await userService.validatePhoneUpdate(
    session.user.id,
    parsed.data.phone,
  )

  if (!phoneValidation.success) {
    return { success: false, error: phoneValidation.error }
  }

  const requestHeaders = await headers()
  const authUpdate = userService.prepareAuthUpdate(parsed.data)

  try {
    await auth.api.updateUser({
      body: authUpdate,
      headers: requestHeaders,
    })

    await userRepository.updatePhone(session.user.id, phoneValidation.phone)
  } catch (error) {
    console.error("updateProfile", error)
    return {
      success: false,
      error: "Não foi possível atualizar o perfil. Tente novamente.",
    }
  }

  revalidateProfilePaths()

  return { success: true }
}

export async function changeProfileEmail(
  input: ChangeEmailInput,
): Promise<ChangeEmailResult> {
  const parsed = ChangeEmailSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  if (parsed.data.newEmail === session.user.email) {
    return {
      success: false,
      error: "O novo e-mail deve ser diferente do atual.",
    }
  }

  try {
    await auth.api.changeEmail({
      body: {
        newEmail: parsed.data.newEmail,
        callbackURL: `${baseUrl}${parsed.data.callbackPath ?? PATHS.PROFILE.ROOT}`,
      },
      headers: await headers(),
    })

    return {
      success: true,
      message:
        "Enviamos um e-mail de verificação para o novo endereço. Confirme o link para concluir a alteração.",
    }
  } catch (error) {
    console.error("changeProfileEmail", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o e-mail. Tente novamente.",
    }
  }
}
