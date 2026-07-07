import { PanelPage } from "@/src/app/(authenticated)/panel/_components/panel-page"

import { All } from "./used/all"

export default function Page() {
  return (
    <PanelPage title="Barbearias">
      <All />
    </PanelPage>
  )
}
