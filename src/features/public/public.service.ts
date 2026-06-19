import { publicRepository } from "@/src/features/public/public.repository"
import type { PublicBarberForBooking } from "@/src/features/public/public.types"

export const publicService = {
  async getBarbershops(params: { title?: string; service?: string }) {
    return publicRepository.findBarbershops(params)
  },

  getRecommendedBarbershops() {
    return publicRepository.findRecommendedBarbershops()
  },

  getPopularBarbershops() {
    return publicRepository.findPopularBarbershops()
  },

  getBarbershopBySlug(slug: string) {
    return publicRepository.findBarbershopBySlug(slug)
  },

  async getBarbershopBarbers(
    organizationId: string,
  ): Promise<PublicBarberForBooking[]> {
    const barberMembers =
      await publicRepository.findBarbershopBarbers(organizationId)

    return barberMembers.map((member) => ({
      id: member.id,
      user: { name: member.user.name ?? "Barbeiro" },
      schedules: [],
      breaks: [],
      blockedSlots: [],
    }))
  },
}
