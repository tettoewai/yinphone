import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import Footer from "@/components/footer"
import { FavouritesProvider } from "@/lib/favourites"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const myanmarBody = localFont({
  src: "./fonts/font-body.ttf",
  variable: "--font-font-body",
  display: "swap",
})

const myanmarHeading = localFont({
  src: "./fonts/font-heading.ttf",
  variable: "--font-font-heading",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        geist.variable,
        myanmarBody.variable,
        myanmarHeading.variable,
        "font-sans"
      )}
    >
      <body className="flex min-h-svh flex-col bg-background">
        <ThemeProvider>
          <FavouritesProvider>
            {children}
            <Footer />
          </FavouritesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
