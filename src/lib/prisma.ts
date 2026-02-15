import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../prisma/generated/prisma/client"

declare global {
  // eslint-disable-next-line no-unused-vars
  var cachedPrisma: PrismaClient
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg({ connectionString })

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export const db = prisma
