import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-unused-vars
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.cachedPrisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    global.cachedPrisma = new PrismaClient({ adapter })
  }
  prisma = global.cachedPrisma
}

export const db = prisma
