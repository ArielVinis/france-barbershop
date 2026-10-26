import Image from "next/image"
import Link from "next/link"

import ThemeSwitcher from "@/src/components/templates/ThemeSwitcher/ThemeSwitcher"
import { PATHS } from "@/src/shared/constants/PATHS"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={PATHS.ROOT}
            className="flex items-center gap-2 font-medium"
          >
            <div className="flex h-20 w-20 items-center justify-center">
              <Image
                src="/logo.png"
                alt="France Barber"
                width={200}
                height={200}
                className="mx-auto max-w-full object-contain"
                loading="eager"
              />
            </div>
            France Barber
          </Link>
          <ThemeSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="https://i.pinimg.com/736x/64/54/ae/6454ae91eb3a58e151efce7e1121c14a.jpg"
          alt="Barbershop interior"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          sizes="50vw"
          priority
        />
      </div>
    </div>
  )
}
