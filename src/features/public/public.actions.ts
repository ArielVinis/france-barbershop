"use server"

import { publicService } from "@/src/features/public/public.service"
import type { GetBarbershopsProps } from "@/src/features/public/public.types"

export const getBarbershops = async ({ searchParams }: GetBarbershopsProps) => {
  const params = await searchParams
  return publicService.getBarbershops(params)
}

export async function getRecommendedBarbershops() {
  return publicService.getRecommendedBarbershops()
}

export async function getPopularBarbershops() {
  return publicService.getPopularBarbershops()
}

export async function getBarbershopBySlug(slug: string) {
  return publicService.getBarbershopBySlug(slug)
}

export async function getBarbershopBarbers(organizationId: string) {
  return publicService.getBarbershopBarbers(organizationId)
}
