import { db } from "@/src/shared/lib/prisma"

export const userRepository = {
  findProfileById(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
      },
    })
  },

  findByPhone(phone: string) {
    return db.user.findUnique({
      where: { phone },
      select: { id: true },
    })
  },

  updatePhone(userId: string, phone: string | null) {
    return db.user.update({
      where: { id: userId },
      data: { phone },
    })
  },
}
