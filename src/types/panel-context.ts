export type PanelContextOwner = {
  role: "OWNER"
  userId: string
  barbershopId: string
}

export type PanelContextBarber = {
  role: "BARBER"
  userId: string
  barberId: string
  barbershopId: string
}

export type PanelContext = PanelContextOwner | PanelContextBarber

export function isOwnerContext(c: PanelContext): c is PanelContextOwner {
  return c.role === "OWNER"
}
