/**
 * Uma linha de `getOwnerBarbers` (member barbeiro + organização).
 */
export type OwnerBarberListRow = {
  id: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
  }
}
