/**
 * Resolve a lista de IDs de loja para queries do **dono** no painel.
 *
 * - `scopedBarbershopId` ausente, vazio ou `"all"` → todas as lojas em `ownerBarbershopIds`.
 * - UUID presente em `ownerBarbershopIds` → só essa loja.
 * - UUID **fora** de `ownerBarbershopIds` → `[]` (sem alargar a “todas”; evita fuga de escopo
 *   se um ID cru do cliente chegar mal validado).
 *
 * `ownerBarbershopIds` deve ser o conjunto já conhecido das lojas do dono (ex. `owner.barbershops.map(b => b.id)`).
 */
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
