"use client"

import { Heart, Menu } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { BrandMark } from "@workspace/ui/components/brand-mark"

import AppMenu from "@/components/app-menu"
import { Link } from "@/i18n/navigation"
import { useFavourites } from "@/lib/favourites"
import { formatDigits } from "@/lib/format"

/**
 * Order matters: new arrivals first, then the full catalogue. The menu button
 * stays visible at every breakpoint because it is the only route to the
 * language switcher, not just the small-screen fallback.
 */
const NAV = [
  { href: "/catalog?sort=newest", key: "newArrivals" },
  { href: "/catalog", key: "catalog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { count, isReady } = useFavourites()
  const locale = useLocale()
  const t = useTranslations("Nav")
  const common = useTranslations("Common")
  const hasFavourites = isReady && count > 0

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link
            href="/"
            aria-label={common("home")}
            className="flex items-baseline gap-2"
          >
            <BrandMark className="h-[14px] w-[19px] shrink-0 text-primary" />
            <span className="font-heading text-xl leading-none tracking-[0.01em] text-foreground">
              YinPhone
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {NAV.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium tracking-[0.03em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <Link
              href="/saved"
              aria-label={
                hasFavourites ? t("savedAriaCount", { count }) : t("savedAria")
              }
              className="relative flex size-10 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-secondary"
            >
              <Heart className="size-[18px]" strokeWidth={1.9} />
              {hasFavourites ? (
                <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground">
                  {formatDigits(count, locale)}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={isMenuOpen}
              aria-haspopup="dialog"
              className="flex size-10 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-secondary"
            >
              <Menu className="size-[19px]" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </header>

      {/*
        Rendered as a sibling of <header>, never inside it. The header's
        backdrop-filter makes it the containing block for `position: fixed`
        descendants, which would trap the sheet's overlay inside the 64px bar.
      */}
      {isMenuOpen ? <AppMenu onClose={() => setIsMenuOpen(false)} /> : null}
    </>
  )
}
