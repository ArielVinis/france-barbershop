import type { AppRole, PolicyStatement } from "./types"

const isSameBarbershop = (
  contextBarbershopId?: string | null,
  resourceBarbershopId?: string | null,
) => {
  if (!contextBarbershopId || !resourceBarbershopId) return false
  return contextBarbershopId === resourceBarbershopId
}

export const policies: Record<AppRole, PolicyStatement[]> = {
  DEV: [
    {
      actions: ["manage"],
      resource: "*",
    },
  ],
  OWNER: [
    { actions: ["read"], resource: "dashboard" },
    {
      actions: ["read", "create", "update", "delete"],
      resource: "barbershop",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "create", "update", "delete"],
      resource: "barber",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "create", "update", "delete"],
      resource: "service",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "create", "update", "delete"],
      resource: "booking",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "create", "update", "delete"],
      resource: "availability",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "update"],
      resource: "profile",
      when: (ctx) => ctx.userId.length > 0,
    },
  ],
  MANAGER: [
    { actions: ["read"], resource: "dashboard" },
    {
      actions: ["read", "create", "update"],
      resource: "barber",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "create", "update"],
      resource: "service",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "create", "update"],
      resource: "booking",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "update"],
      resource: "availability",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId),
    },
    {
      actions: ["read", "update"],
      resource: "profile",
      when: (ctx) => ctx.userId.length > 0,
    },
  ],
  BARBER: [
    { actions: ["read"], resource: "dashboard" },
    {
      actions: ["read"],
      resource: "booking",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId) &&
        (!!resource.barberId ? resource.barberId === ctx.barberId : true),
    },
    {
      actions: ["update"],
      resource: "booking",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId) &&
        resource.barberId === ctx.barberId,
    },
    {
      actions: ["read", "update"],
      resource: "availability",
      when: (ctx, resource) =>
        isSameBarbershop(ctx.barbershopId, resource.barbershopId) &&
        resource.barberId === ctx.barberId,
    },
    {
      actions: ["read", "update"],
      resource: "profile",
      when: (ctx) => ctx.userId.length > 0,
    },
  ],
  CLIENT: [
    { actions: ["read"], resource: "dashboard" },
    { actions: ["read"], resource: "service" },
    {
      actions: ["create"],
      resource: "booking",
      when: (_, resource) => Boolean(resource.barbershopId),
    },
    {
      actions: ["read", "update", "delete"],
      resource: "booking",
      when: (ctx, resource) => resource.clientId === ctx.userId,
    },
    {
      actions: ["read", "update"],
      resource: "profile",
      when: (ctx) => ctx.userId.length > 0,
    },
  ],
}
