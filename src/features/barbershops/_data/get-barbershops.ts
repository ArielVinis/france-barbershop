"use server"

import { db } from "../../../lib/prisma"

export interface GetBarbershopsProps {
  searchParams: Promise<{
    title?: string
    service?: string
  }>
}

export const getBarbershops = async ({ searchParams }: GetBarbershopsProps) => {
  const params = await searchParams
  return db.barbershop.findMany({
    where: {
      OR: [
        params?.title
          ? {
              name: {
                contains: params?.title,
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
}
