"use client"

import { ArrowLeft, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

type CatalogSearch = {
  value: string
  isOpen: boolean
  onChange: (value: string) => void
  onToggle: () => void
}

type CatalogHeaderProps = {
  title: string
  subtitle: string
  search?: CatalogSearch
}

export default function CatalogHeader({
  title,
  subtitle,
  search,
}: CatalogHeaderProps) {
  const t = useTranslations("Catalog")
  const common = useTranslations("Common")

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center gap-1 px-3 py-2">
        <Link
          href="/"
          aria-label={common("goHome")}
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md"
        >
          <ArrowLeft
            className="size-[22px] text-foreground"
            strokeWidth={2.2}
          />
        </Link>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate font-body text-base leading-[1.7] font-bold text-foreground">
            {title}
          </div>
          <div className="-mt-1 text-xs text-muted-foreground">{subtitle}</div>
        </div>

        {search ? (
          <button
            type="button"
            onClick={search.onToggle}
            aria-label={search.isOpen ? t("closeSearch") : t("searchLabel")}
            aria-expanded={search.isOpen}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-border bg-card"
          >
            {search.isOpen ? (
              <X className="size-[19px] text-foreground" strokeWidth={2.5} />
            ) : (
              <Search
                className="size-[19px] text-foreground"
                strokeWidth={2.5}
              />
            )}
          </button>
        ) : (
          <div className="w-[44px] shrink-0" />
        )}
      </div>

      {search?.isOpen ? (
        <form role="search" className="px-4 pb-3">
          <label htmlFor="catalog-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={2.82}
            />
            <input
              id="catalog-search"
              type="search"
              autoFocus
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="min-h-[44px] w-full rounded-md border border-border bg-card pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
        </form>
      ) : null}
    </header>
  )
}
