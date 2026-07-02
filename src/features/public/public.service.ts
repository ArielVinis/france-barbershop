import { unstable_cache } from "next/cache"
import { serializeBarbershopPageData } from "@/src/features/public/_lib/serialize-barbershop-page"
import { publicRepository } from "@/src/features/public/public.repository"
import type {
  PublicBarberForBooking,
  PublicBarbershopPageData,
} from "@/src/features/public/public.types"

import { cacheTags } from "@/src/shared/constants/cache-tags"

async function fetchBarbershopPageData(
  slug: string,
): Promise<PublicBarbershopPageData | null> {
  const organization = await publicRepository.findBarbershopPageBySlug(slug)
  if (!organization) return null

  return serializeBarbershopPageData(organization)
}

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
    return unstable_cache(
      () => publicRepository.findBarbershopBySlug(slug),
      ["barbershop-by-slug", slug],
      {
        revalidate: 300,
        tags: [cacheTags.orgSlug(slug)],
      },
    )()
  },

  getBarbershopPageData(
    slug: string,
  ): Promise<PublicBarbershopPageData | null> {
    return unstable_cache(
      () => fetchBarbershopPageData(slug),
      ["barbershop-page", slug],
      {
        revalidate: 300,
        tags: [cacheTags.orgSlug(slug)],
      },
    )()
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
