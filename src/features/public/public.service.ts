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
  getBarbershops(params: { title?: string; service?: string }) {
    const title = params.title ?? ""
    const service = params.service ?? ""
    return unstable_cache(
      () => publicRepository.findBarbershops(params),
      ["barbershops-search", title, service],
      {
        revalidate: 300,
        tags: [cacheTags.orgList],
      },
    )()
  },

  getRecommendedBarbershops() {
    return unstable_cache(
      () => publicRepository.findRecommendedBarbershops(),
      ["barbershops-recommended"],
      {
        revalidate: 300,
        tags: [cacheTags.orgList],
      },
    )()
  },

  getPopularBarbershops() {
    return unstable_cache(
      () => publicRepository.findPopularBarbershops(),
      ["barbershops-popular"],
      {
        revalidate: 300,
        tags: [cacheTags.orgList],
      },
    )()
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
