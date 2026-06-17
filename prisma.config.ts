import "dotenv/config"
import { defineConfig } from "prisma/config"
import { getDirectDatabaseUrl } from "./src/shared/lib/get-direct-database-url"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getDirectDatabaseUrl(),
  },
})
