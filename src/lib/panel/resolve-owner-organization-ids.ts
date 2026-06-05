export function resolveOwnerOrganizationIdsForQueries(
  ownerOrganizationIds: readonly string[],
  scopedOrganizationId: string | null | undefined,
): string[] {
  if (ownerOrganizationIds.length === 0) return []
  if (
    scopedOrganizationId == null ||
    scopedOrganizationId === "" ||
    scopedOrganizationId === "all"
  ) {
    return [...ownerOrganizationIds]
  }
  if (!ownerOrganizationIds.includes(scopedOrganizationId)) return []
  return [scopedOrganizationId]
}
