import { PATHS } from "@/src/constants/PATHS"
import {
  LayoutDashboardIcon,
  UserPlusIcon,
  WrenchIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "lucide-react"

export const sidebarItems = {
  //   user: {
  //     name: "FranceTech",
  //     email: "teste@email.com",
  //     image: "/avatars/shadcn.jpg",
  //   },
  navMain: [
    {
      name: "Dashboard",
      url: PATHS.PANEL.ROOT,
      icon: LayoutDashboardIcon,
    },
    {
      name: "Agendamentos",
      url: PATHS.PANEL.SCHEDULE,
      icon: CalendarDaysIcon,
    },
    {
      name: "Barbeiros",
      url: PATHS.PANEL.BARBERS,
      icon: UserPlusIcon,
    },
    {
      name: "Serviços",
      url: PATHS.PANEL.SERVICES,
      icon: WrenchIcon,
    },
    {
      name: "Horários de trabalho",
      url: PATHS.PANEL.WORKED_HOURS,
      icon: ClockIcon,
    },
  ],
  sections: [
    // {
    //     name: "Exemplos",
    //     items: [
    //         {
    //           name: "Exemplo 1",
    //           icon: UserIcon,
    //           isActive: true,
    //           url: "#",
    //         },
    //     ]
    // },
  ],
}
