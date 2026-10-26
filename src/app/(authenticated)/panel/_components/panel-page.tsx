import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { cn } from "@/src/shared/lib/utils"

type PanelPageProps = {
  title: string
  rightContent?: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
  fillViewport?: boolean
}

export function PanelPage({
  title,
  rightContent,
  children,
  contentClassName,
  fillViewport = false,
}: PanelPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SiteHeader title={title} rightContent={rightContent} />
      <div
        className={
          fillViewport
            ? "@container/main flex min-h-0 flex-1 flex-col overflow-hidden"
            : "@container/main min-h-0 flex-1 overflow-y-auto"
        }
      >
        <div
          className={cn(
            fillViewport
              ? "flex min-h-0 flex-1 flex-col gap-3 pt-3 md:gap-4 md:pt-4"
              : "flex min-h-full flex-col gap-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:gap-4 md:pt-4 md:pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
