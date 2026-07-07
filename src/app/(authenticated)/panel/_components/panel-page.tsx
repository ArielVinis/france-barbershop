import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { cn } from "@/src/shared/lib/utils"

type PanelPageProps = {
  title: string
  rightContent?: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
}

export function PanelPage({
  title,
  rightContent,
  children,
  contentClassName,
}: PanelPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SiteHeader title={title} rightContent={rightContent} />
      <div className="@container/main min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "flex flex-col gap-4 py-4 md:gap-6 md:py-6",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
