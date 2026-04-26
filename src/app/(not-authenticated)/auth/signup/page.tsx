import Link from "next/link"
import { PATHS } from "@/src/constants/PATHS"
import { SignupForm } from "@/src/components/auth/signup-form"
import Image from "next/image"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href={PATHS.ROOT}
            className="flex items-center gap-2 font-medium"
          >
            <div className="flex h-20 w-20 items-center justify-center">
              <Image
                src="/logo.png"
                alt="FranceTech"
                width={200}
                height={200}
                className="mx-auto max-w-full object-contain"
              />
            </div>
            France Barber
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://i.pinimg.com/736x/64/54/ae/6454ae91eb3a58e151efce7e1121c14a.jpg"
          alt="Barbershop interior"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
