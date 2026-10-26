import { mkdir, unlink, writeFile } from "fs/promises"
import path from "path"

import { AVATAR_PUBLIC_PATH } from "@/src/shared/constants/uploads"

export function isLocalAvatarUrl(image?: string | null) {
  return Boolean(image?.startsWith(`${AVATAR_PUBLIC_PATH}/`))
}

export function getAvatarFilePath(userId: string) {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "avatars",
    `${userId}.webp`,
  )
}

export function getAvatarPublicUrl(userId: string) {
  return `${AVATAR_PUBLIC_PATH}/${userId}.webp`
}

export async function saveAvatarFile(userId: string, buffer: Buffer) {
  const directory = path.join(process.cwd(), "public", "uploads", "avatars")
  await mkdir(directory, { recursive: true })

  const filePath = getAvatarFilePath(userId)
  await writeFile(filePath, buffer)

  return getAvatarPublicUrl(userId)
}

export async function deleteLocalAvatarIfExists(image?: string | null) {
  if (!isLocalAvatarUrl(image)) {
    return
  }

  const fileName = image!.replace(`${AVATAR_PUBLIC_PATH}/`, "")
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "avatars",
    fileName,
  )

  try {
    await unlink(filePath)
  } catch {
    // Arquivo pode já ter sido removido.
  }
}
