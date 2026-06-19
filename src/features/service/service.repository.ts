import { db } from "@/src/shared/lib/prisma"

export const serviceRepository = {
  findById(serviceId: string) {
    return db.organizationService.findUnique({
      where: { id: serviceId },
    })
  },

  findByIdWithBookingCount(serviceId: string) {
    return db.organizationService.findUnique({
      where: { id: serviceId },
      include: { _count: { select: { bookings: true } } },
    })
  },

  create(data: {
    organizationId: string
    name: string
    description: string
    imageUrl: string
    price: number
    durationMinutes: number
  }) {
    return db.organizationService.create({
      data,
      select: { id: true },
    })
  },

  update(
    serviceId: string,
    data: {
      name?: string
      description?: string
      imageUrl?: string
      price?: number
      durationMinutes?: number
    },
  ) {
    return db.organizationService.update({
      where: { id: serviceId },
      data,
    })
  },

  delete(serviceId: string) {
    return db.organizationService.delete({ where: { id: serviceId } })
  },

  findManyForOrganizations(organizationIds: string[]) {
    return db.organizationService.findMany({
      where: {
        organizationId: { in: organizationIds },
      },
      orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    })
  },
}
