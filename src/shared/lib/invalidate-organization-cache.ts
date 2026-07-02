import { revalidateTag } from "next/cache"
import { cacheTags } from "@/src/shared/constants/cache-tags"

export function invalidateOrganizationCache(params: {
  slug?: string
  organizationId?: string
}) {
  if (params.slug) {
    revalidateTag(cacheTags.orgSlug(params.slug), "slug")
  }
  if (params.organizationId) {
    revalidateTag(cacheTags.orgId(params.organizationId), "organizationId")
    revalidateTag(cacheTags.dashboard(params.organizationId), "organizationId")
  }
}
