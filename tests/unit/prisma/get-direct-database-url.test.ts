import { describe, it, expect, afterEach } from "vitest"
import { getDirectDatabaseUrl } from "@/src/lib/get-direct-database-url"

describe("getDirectDatabaseUrl", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const originalDirectUrl = process.env.DIRECT_DATABASE_URL

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }

    if (originalDirectUrl === undefined) {
      delete process.env.DIRECT_DATABASE_URL
    } else {
      process.env.DIRECT_DATABASE_URL = originalDirectUrl
    }
  })

  it("prefere DIRECT_DATABASE_URL para o CLI", () => {
    process.env.DATABASE_URL = "postgresql://pooled:6543/db"
    process.env.DIRECT_DATABASE_URL = "postgresql://direct:5432/db"

    expect(getDirectDatabaseUrl()).toBe("postgresql://direct:5432/db")
  })

  it("usa DATABASE_URL quando DIRECT_DATABASE_URL não está definida", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/db"
    delete process.env.DIRECT_DATABASE_URL

    expect(getDirectDatabaseUrl()).toBe("postgresql://localhost:5432/db")
  })

  it("lança erro quando nenhuma URL está definida", () => {
    delete process.env.DATABASE_URL
    delete process.env.DIRECT_DATABASE_URL

    expect(() => getDirectDatabaseUrl()).toThrow("DATABASE_URL is not set")
  })
})
