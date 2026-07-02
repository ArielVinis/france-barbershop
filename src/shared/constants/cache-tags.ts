export const cacheTags = {
  orgSlug: (slug: string) => `org-slug-${slug}`,
  orgId: (organizationId: string) => `org-id-${organizationId}`,
  dashboard: (organizationId: string) => `dashboard-${organizationId}`,
}
