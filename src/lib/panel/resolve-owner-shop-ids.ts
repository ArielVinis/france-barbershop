export function resolveOwnerShopIdsForQueries(
  ownerBarbershopIds: readonly string[],
  scopedBarbershopId: string | null | undefined,
): string[] {
  if (ownerBarbershopIds.length === 0) return []
  if (
    scopedBarbershopId == null ||
    scopedBarbershopId === "" ||
    scopedBarbershopId === "all"
  ) {
    return [...ownerBarbershopIds]
  }
  if (!ownerBarbershopIds.includes(scopedBarbershopId)) return []
  return [scopedBarbershopId]
}
