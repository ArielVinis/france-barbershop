import { revalidateTag } from "next/cache"
import { cacheTags } from "@/src/shared/constants/cache-tags"

export function invalidateOrganizationCache(params: {
  slug?: string
  organizationId?: string
}) {
  revalidateTag(cacheTags.orgList, "max")
  if (params.slug) {
    revalidateTag(cacheTags.orgSlug(params.slug), "max")
  }
  if (params.organizationId) {
    revalidateTag(cacheTags.orgId(params.organizationId), "max")
    revalidateTag(cacheTags.dashboard(params.organizationId), "max")
  }
}
