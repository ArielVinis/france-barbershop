import { PATHS } from "@/src/constants/PATHS"
import { LayoutDashboardIcon, UserPlusIcon, WrenchIcon } from "lucide-react"

export const sidebarItems = {
  //   user: {
  //     name: "FranceTech",
  //     email: "teste@email.com",
  //     image: "/avatars/shadcn.jpg",
  //   },
  navMain: [
    {
      name: "Dashboard",
      url: PATHS.OWNER.HOME,
      icon: LayoutDashboardIcon,
    },
    {
      name: "Barbeiros",
      url: PATHS.OWNER.BARBERS,
      icon: UserPlusIcon,
    },
    {
      name: "Serviços",
      url: PATHS.OWNER.SERVICES,
      icon: WrenchIcon,
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
