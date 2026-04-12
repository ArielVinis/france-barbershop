import type { LucideIcon } from "lucide-react"
import { PATHS } from "@/src/constants/PATHS"
import {
  LayoutDashboardIcon,
  UserPlusIcon,
  WrenchIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "lucide-react"

export type PanelNavRole = "OWNER" | "BARBER"

export type PanelNavMainItemDef = {
  name: string
  url: string
  icon: LucideIcon
  /** Papéis que veem este item. */
  roles: PanelNavRole[]
}

export type PanelNavMainItem = {
  name: string
  url: string
  icon: LucideIcon
}

export const sidebarItems: PanelNavMainItemDef[] = [
  {
    name: "Dashboard",
    url: PATHS.PANEL.ROOT,
    icon: LayoutDashboardIcon,
    roles: ["OWNER", "BARBER"],
  },
  {
    name: "Agendamentos",
    url: PATHS.PANEL.SCHEDULE,
    icon: CalendarDaysIcon,
    roles: ["OWNER", "BARBER"],
  },
  {
    name: "Barbeiros",
    url: PATHS.PANEL.BARBERS,
    icon: UserPlusIcon,
    roles: ["OWNER"],
  },
  {
    name: "Serviços",
    url: PATHS.PANEL.SERVICES,
    icon: WrenchIcon,
    roles: ["OWNER"],
  },
  {
    name: "Horários de trabalho",
    url: PATHS.PANEL.WORKED_HOURS,
    icon: ClockIcon,
    roles: ["OWNER"],
  },
]

export function getPanelNavMainForRole(role: PanelNavRole): PanelNavMainItem[] {
  return sidebarItems
    .filter((item) => item.roles.includes(role))
    .map(({ name, url, icon }) => ({ name, url, icon }))
}
