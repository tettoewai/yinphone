"use client"

import { Heart, Menu } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { BrandMark } from "@workspace/ui/components/brand-mark"

import AppMenu from "@/components/app-menu"
import { Link } from "@/i18n/navigation"
import { useFavourites } from "@/lib/favourites"
import { formatDigits } from "@/lib/format"

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { count, isReady } = useFavourites()
  const locale = useLocale()
  const t = useTranslations("Nav")
  const common = useTranslations("Common")
  const hasFavourites = isReady && count > 0

  return (
    <header className="flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 md:px-6 lg:px-8">
      <Link
        href="/"
        aria-label={common("home")}
        className="flex items-center gap-1.5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <BrandMark className="h-[17px] w-[23px] text-primary-foreground" />
        </div>
        <div className="leading-none">
          <div className="font-heading text-lg font-bold tracking-tight text-foreground">
            YinPhone
          </div>
          <div className="font-body text-xs text-muted-foreground">Yangon</div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/saved"
          aria-label={
            hasFavourites ? t("savedAriaCount", { count }) : t("savedAria")
          }
          className="relative flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card"
        >
          <Heart className="size-5 text-foreground" strokeWidth={2.4} />
          {hasFavourites ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-xl bg-accent px-1 text-[11px] font-bold text-accent-foreground">
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
          className="flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card"
        >
          <Menu className="size-5 text-foreground" />
        </button>
      </div>

      {isMenuOpen ? <AppMenu onClose={() => setIsMenuOpen(false)} /> : null}
    </header>
  )
}
