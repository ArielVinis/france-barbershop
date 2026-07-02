import type { PublicBarbershopPageData } from "@/src/features/public/public.types"
import { publicRepository } from "@/src/features/public/public.repository"

type BarbershopPageRow = NonNullable<
  Awaited<ReturnType<typeof publicRepository.findBarbershopPageBySlug>>
>

export function serializeBarbershopPageData(
  organization: BarbershopPageRow,
): PublicBarbershopPageData {
  const { members, services, blockedSlots, schedules, breaks, ...orgBase } =
    organization

  const payload: PublicBarbershopPageData = {
    organization: {
      id: orgBase.id,
      name: orgBase.name,
      slug: orgBase.slug,
      logo: orgBase.logo,
      address: orgBase.address,
      phones: orgBase.phones,
      description: orgBase.description,
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        imageUrl: service.imageUrl,
        price: Number(service.price),
        durationMinutes: service.durationMinutes,
        organizationId: service.organizationId,
      })),
      schedules: schedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
      })),
      breaks: breaks.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      })),
      blockedSlots: blockedSlots.map((slot) => ({
        startAt: slot.startAt.toISOString(),
        endAt: slot.endAt.toISOString(),
      })),
    },
    barbers: members.map((member) => ({
      id: member.id,
      user: { name: member.user.name ?? "Barbeiro" },
      schedules: [],
      breaks: [],
      blockedSlots: [],
    })),
  }

  return JSON.parse(JSON.stringify(payload)) as PublicBarbershopPageData
}
