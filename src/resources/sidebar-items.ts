import type { LucideIcon } from "lucide-react"
import { PATHS } from "@/src/shared/constants/PATHS"
import {
  LayoutDashboardIcon,
  UserPlusIcon,
  WrenchIcon,
  CalendarDaysIcon,
  ClockIcon,
  Building2Icon,
} from "lucide-react"
import { Role } from "@/prisma/generated/prisma/enums"

export type PanelNavRole =
  | typeof Role.OWNER
  | typeof Role.MANAGER
  | typeof Role.MEMBER

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
    roles: [Role.OWNER, Role.MANAGER, Role.MEMBER],
  },
  {
    name: "Agendamentos",
    url: PATHS.PANEL.SCHEDULE,
    icon: CalendarDaysIcon,
    roles: [Role.OWNER, Role.MANAGER, Role.MEMBER],
  },
  {
    name: "Organização",
    url: PATHS.PANEL.ORGANIZATION,
    icon: Building2Icon,
    roles: [Role.OWNER, Role.MANAGER],
  },
  {
    name: "Barbeiros",
    url: PATHS.PANEL.BARBERS,
    icon: UserPlusIcon,
    roles: [Role.OWNER, Role.MANAGER],
  },
  {
    name: "Serviços",
    url: PATHS.PANEL.SERVICES,
    icon: WrenchIcon,
    roles: [Role.OWNER, Role.MANAGER],
  },
  {
    name: "Horários de trabalho",
    url: PATHS.PANEL.WORKED_HOURS,
    icon: ClockIcon,
    roles: [Role.OWNER, Role.MANAGER],
  },
]

export function getPanelNavMainForRole(role: PanelNavRole): PanelNavMainItem[] {
  return sidebarItems
    .filter((item) => item.roles.includes(role))
    .map(({ name, url, icon }) => ({ name, url, icon }))
}
