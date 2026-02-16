import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import Footer from "../components/layout/footer"
import AuthProvider from "../providers/auth"

export const metadata: Metadata = {
  title: "France Barber",
  description:
    "France Barber é um sistema de agendamento de serviços de barbearia online.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <div className="flex h-full flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
