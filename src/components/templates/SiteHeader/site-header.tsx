import ThemeSwitcher from "@/src/components/templates/ThemeSwitcher/ThemeSwitcher"
import { Separator } from "@/src/components/ui/separator"
import { SidebarTrigger } from "@/src/components/ui/sidebar"

interface SiteHeaderProps {
  title: string
  rightContent?: React.ReactNode
}

export function SiteHeader({ title, rightContent }: SiteHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="min-w-0 truncate text-base font-medium">{title}</h1>
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          {rightContent}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
