import { Separator } from "@/src/components/ui/separator"
import { SidebarTrigger } from "@/src/components/ui/sidebar"

export function SiteHeader({
  title,
  rightContent,
}: {
  title: any
  rightContent?: any
}) {
  return (
    <header className="h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b py-4 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        {rightContent && (
          <div className="flex flex-1 flex-col items-end justify-end">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  )
}
