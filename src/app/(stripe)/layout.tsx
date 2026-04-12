import Link from "next/link"
import Image from "next/image"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-full flex-col items-center justify-center gap-5">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={100}
          height={100}
          style={{ width: "auto", height: "auto" }}
          loading="eager"
        />
      </Link>
      {children}
    </section>
  )
}
