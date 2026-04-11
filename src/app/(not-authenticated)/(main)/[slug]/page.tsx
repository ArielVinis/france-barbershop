import PhoneItem from "@/src/components/barbershop/phone-item"
import ServiceItem from "@/src/components/barbershop/service-item"
import SidebarSheet from "@/src/components/layout/sidebar-sheet"
import { Button, buttonVariants } from "@/src/components/ui/button"
import { Sheet, SheetTrigger } from "@/src/components/ui/sheet"
import { cn } from "@/src/lib/utils"
import { PATHS } from "@/src/constants/PATHS"
import { db } from "@/src/lib/prisma"
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BarbershopPageProps {
  params: Promise<{
    slug: string
  }>
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const { slug } = await params

  const barbershop = await db.barbershop.findUnique({
    where: {
      slug,
    },
    include: {
      services: true,
      barbers: {
        where: { isActive: true },
        include: {
          user: true,
          breaks: true,
          schedules: { orderBy: { dayOfWeek: "asc" } },
          blockedSlots: { orderBy: { startAt: "asc" } },
        },
      },
      schedules: true,
      breaks: true,
      blockedSlots: true,
    },
  })

  if (!barbershop) {
    return notFound()
  }

  return (
    <div>
      {/* IMAGEM */}
      <div className="relative h-[250px] w-full">
        <Image
          alt={barbershop.name}
          src={barbershop?.imageUrl}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4"
          asChild
        >
          <Link href={PATHS.ROOT}>
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Sheet>
          <SheetTrigger
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "absolute right-4 top-4",
            )}
          >
            <MenuIcon />
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </div>

      {/* TÍTULO */}
      <div className="border-b border-solid p-5">
        <h1 className="mb-3 text-xl font-bold">{barbershop.name}</h1>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop?.address}</p>
        </div>

        <div className="flex items-center gap-2">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">5,0 (499 avaliações)</p>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Sobre nós</h2>
        <p className="text-justify text-sm">{barbershop?.description}</p>
      </div>

      {/* SERVIÇOS */}
      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Serviços</h2>
        <div className="space-y-3">
          {barbershop.services.map((service) => (
            <ServiceItem
              key={service.id}
              barbershop={JSON.parse(JSON.stringify(barbershop))}
              service={JSON.parse(JSON.stringify(service))}
              barbers={JSON.parse(JSON.stringify(barbershop.barbers))}
            />
          ))}
        </div>
      </div>

      {/* CONTATO */}
      <div className="space-y-3 p-5">
        {barbershop.phones.map((phone) => (
          <PhoneItem key={phone} phone={phone} />
        ))}
      </div>
    </div>
  )
}

export default BarbershopPage
