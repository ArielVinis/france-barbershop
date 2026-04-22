export const PERMISSIONS = {
  roles: ["DEV", "OWNER", "MANAGER", "BARBER", "CLIENT"],
  actions: ["read", "create", "update", "delete", "manage"],
  resources: [
    "dashboard",
    "barbershop",
    "barber",
    "service",
    "booking",
    "availability",
    "profile",
  ],
} as const

export type AppRole = (typeof PERMISSIONS.roles)[number]
export type AppAction = (typeof PERMISSIONS.actions)[number]
export type AppResource = (typeof PERMISSIONS.resources)[number]

export type AuthContext = {
  userId: string
  role: AppRole
  barbershopId?: string | null
  barberId?: string | null
}

export type ResourceData = Partial<{
  userId: string | null
  clientId: string | null
  barberId: string | null
  barbershopId: string | null
}>

export type PolicyStatement = {
  actions: AppAction[]
  resource: AppResource | "*"
  when?: (_ctx: AuthContext, _resource: ResourceData) => boolean
}

export function toAppRole(value?: string | null): AppRole {
  return PERMISSIONS.roles.includes(value as AppRole)
    ? (value as AppRole)
    : "CLIENT"
}
