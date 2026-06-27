import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"

import { All } from "./used/all"

export default function Page() {
  return (
    <>
      <SiteHeader title="Barbearias" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="md:y-6 flex flex-col gap-4 p-4 md:gap-6">
            <All />
          </div>
        </div>
      </div>
    </>
  )
}
