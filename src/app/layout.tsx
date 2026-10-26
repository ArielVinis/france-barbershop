import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/src/components/ui/sonner"
import "./globals.css"

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
