import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import Footer from "@/components/footer"
import { routing } from "@/i18n/routing"
import { FavouritesProvider } from "@/lib/favourites"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const myanmarBody = localFont({
  src: "../../../../packages/ui/src/fonts/font-body.ttf",
  variable: "--font-font-body",
  display: "swap",
})

const myanmarHeading = localFont({
  src: "../../../../packages/ui/src/fonts/font-heading.ttf",
  variable: "--font-font-heading",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale, namespace: "Metadata" })

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: t("siteName"),
    title: {
      default: t("home.title"),
      template: `%s — YinPhone`,
    },
    description: t("home.description"),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  // `/xx/...` is not a locale the proxy knows about.
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html
      lang={locale}
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
        <NextIntlClientProvider>
          <ThemeProvider>
            <FavouritesProvider>
              {children}
              <Footer />
            </FavouritesProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
