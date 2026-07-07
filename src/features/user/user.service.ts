import { userRepository } from "@/src/features/user/user.repository"
import type { ClientProfile } from "@/src/features/user/user.types"
import type { UpdateProfileInput } from "@/src/features/user/user.schema"

export const userService = {
  async getProfile(userId: string): Promise<ClientProfile | null> {
    return userRepository.findProfileById(userId)
  },

  normalizePhone(phone?: string) {
    const trimmed = phone?.trim()
    return trimmed ? trimmed : null
  },

  async validatePhoneUpdate(userId: string, phone?: string) {
    const normalizedPhone = userService.normalizePhone(phone)

    if (!normalizedPhone) {
      return { success: true as const, phone: null }
    }

    const existing = await userRepository.findByPhone(normalizedPhone)
    if (existing && existing.id !== userId) {
      return {
        success: false as const,
        error: "Este telefone já está em uso",
      }
    }

    return { success: true as const, phone: normalizedPhone }
  },

  prepareAuthUpdate(input: UpdateProfileInput) {
    return {
      name: input.name.trim(),
    }
  },
}
