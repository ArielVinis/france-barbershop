import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/shared/lib/prisma"

export const memberRepository = {
  findUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: {
        members: { where: { role: Role.MEMBER }, take: 1 },
      },
    })
  },

  findMemberInOrganization(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: {
        organizationId,
        userId,
      },
    })
  },

  findById(barberId: string) {
    return db.member.findUnique({
      where: { id: barberId },
    })
  },

  findByIdSelect(barberId: string) {
    return db.member.findUnique({
      where: { id: barberId },
      select: { organizationId: true, isActive: true },
    })
  },

  delete(barberId: string) {
    return db.member.delete({ where: { id: barberId } })
  },

  updateActive(barberId: string, isActive: boolean) {
    return db.member.update({
      where: { id: barberId },
      data: { isActive },
    })
  },

  createBarber(data: { userId: string; organizationId: string }) {
    return db.$transaction([
      db.user.update({
        where: { id: data.userId },
        data: { role: Role.MEMBER },
      }),
      db.member.create({
        data: {
          userId: data.userId,
          organizationId: data.organizationId,
          role: Role.MEMBER,
          isActive: true,
        },
      }),
    ])
  },

  findBarberMember(barberId: string) {
    return db.member.findFirst({
      where: { id: barberId, role: Role.MEMBER },
      include: {
        user: { select: { name: true, email: true } },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            schedules: { orderBy: { dayOfWeek: "asc" } },
            breaks: true,
            blockedSlots: { orderBy: { startAt: "asc" } },
          },
        },
      },
    })
  },

  findBarberByUserId(userId: string) {
    return db.member.findFirst({
      where: { userId, role: Role.MEMBER },
      include: {
        user: { select: { name: true, image: true, email: true } },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            schedules: { orderBy: { dayOfWeek: "asc" } },
            breaks: true,
            blockedSlots: { orderBy: { startAt: "asc" } },
          },
        },
      },
    })
  },

  findOwnerBarbers(organizationIds: string[]) {
    return db.member.findMany({
      where: {
        organizationId: { in: organizationIds },
        role: Role.MEMBER,
      },
      orderBy: [{ organization: { name: "asc" } }, { createdAt: "asc" }],
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })
  },
}
