export function getDirectDatabaseUrl(): string {
  const directUrl = process.env.DIRECT_DATABASE_URL?.trim()
  if (directUrl) return directUrl

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  return databaseUrl
}
