import PhoneItem from "@/src/components/barbershop/phone-item"
import ServiceItem from "@/src/components/barbershop/service-item"
import SidebarSheet from "@/src/components/layout/sidebar-sheet"
import { Button, buttonVariants } from "@/src/components/ui/button"
import { Sheet, SheetTrigger } from "@/src/components/ui/sheet"
import { cn } from "@/src/shared/lib/utils"
import { PATHS } from "@/src/shared/constants/PATHS"
import { getBarbershopPageData } from "@/src/features/public/public.actions"
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
  const pageData = await getBarbershopPageData(slug)

  if (!pageData) {
    return notFound()
  }

  const { organization, barbers } = pageData
  const organizationForBooking = {
    name: organization.name,
    schedules: organization.schedules,
    breaks: organization.breaks,
    blockedSlots: organization.blockedSlots,
  }

  return (
    <div>
      <div className="relative h-[250px] w-full">
        <Image
          alt={organization.name}
          src={organization.logo ?? "/banner.png"}
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

      <div className="border-b border-solid p-5">
        <h1 className="mb-3 text-xl font-bold">{organization.name}</h1>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{organization.address}</p>
        </div>

        <div className="flex items-center gap-2">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">5,0 (499 avaliações)</p>
        </div>
      </div>

      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Sobre nós</h2>
        <p className="text-justify text-sm">{organization.description}</p>
      </div>

      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Serviços</h2>
        <div className="space-y-3">
          {organization.services.map((service) => (
            <ServiceItem
              key={service.id}
              organization={JSON.parse(JSON.stringify(organizationForBooking))}
              service={JSON.parse(JSON.stringify(service))}
              barbers={JSON.parse(JSON.stringify(barbers))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 p-5">
        {organization.phones.map((phone) => (
          <PhoneItem key={phone} phone={phone} />
        ))}
      </div>
    </div>
  )
}

export default BarbershopPage
