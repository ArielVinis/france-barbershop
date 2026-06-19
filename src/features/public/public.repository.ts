import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/shared/lib/prisma"

export const publicRepository = {
  findBarbershops(params: { title?: string; service?: string }) {
    return db.organization.findMany({
      where: {
        OR: [
          params?.title
            ? {
                name: {
                  contains: params.title,
                  mode: "insensitive",
                },
              }
            : {},
          params.service
            ? {
                services: {
                  some: {
                    name: {
                      contains: params.service,
                      mode: "insensitive",
                    },
                  },
                },
              }
            : {},
        ],
      },
    })
  },

  findRecommendedBarbershops() {
    return db.organization.findMany()
  },

  findPopularBarbershops() {
    return db.organization.findMany({
      orderBy: { name: "desc" },
    })
  },

  findBarbershopBySlug(slug: string) {
    return db.organization.findFirst({
      where: { slug },
      include: {
        services: true,
        schedules: true,
        breaks: true,
        blockedSlots: true,
      },
    })
  },

  findBarbershopBarbers(organizationId: string) {
    return db.member.findMany({
      where: {
        organizationId,
        role: Role.MEMBER,
        isActive: true,
      },
      select: {
        id: true,
        user: { select: { name: true } },
      },
    })
  },
}
