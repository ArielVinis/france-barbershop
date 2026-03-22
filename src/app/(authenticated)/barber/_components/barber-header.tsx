import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "@/src/components/ui/sheet"
import { BarberMenuContent } from "./barber-menu-content"
import { PATHS } from "@/src/constants/PATHS"

type BarberHeaderProps = {
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershop: {
    name: string
    slug: string
    imageUrl: string
    schedules: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }>
  }
}

export function BarberHeader({ user, barbershop }: BarberHeaderProps) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Link href={PATHS.BARBERSHOP.HOME(barbershop.slug)}>
          <Image
            alt={barbershop.name}
            src={barbershop.imageUrl ?? "/logo.png"}
            width={50}
            height={50}
            style={{ width: "auto", height: "auto" }}
          />
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <BarberMenuContent user={user} barbershop={barbershop} />
        </Sheet>
      </CardContent>
    </Card>
  )
}
