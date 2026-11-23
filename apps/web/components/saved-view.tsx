"use client"

import { Heart } from "lucide-react"
import { useTranslations } from "next-intl"

import CatalogCard from "@/components/catalog-card"
import CatalogHeader from "@/components/catalog-header"
import { pickByIds, type CatalogProduct } from "@/components/catalog-data"
import { Link } from "@/i18n/navigation"
import { useFavourites } from "@/lib/favourites"

type SavedViewProps = {
  /** The whole catalogue; favourites are a set of slugs within it. */
  products: CatalogProduct[]
}

export default function SavedView({ products }: SavedViewProps) {
  const t = useTranslations("Saved")
  const common = useTranslations("Common")
  const { ids, isReady, clear } = useFavourites()
  const saved = pickByIds(products, ids)

  if (!isReady) {
    return (
      <>
        <CatalogHeader title={t("title")} subtitle={t("empty.title")} />
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-md border border-border bg-secondary"
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <CatalogHeader
        title={t("title")}
        subtitle={t("count", { count: saved.length })}
      />

      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
            <Heart className="size-[34px] text-primary" strokeWidth={1.6} />
          </div>
          <div className="font-body text-base leading-[1.7] font-semibold text-foreground">
            {t("empty.title")}
          </div>
          <p className="max-w-[280px] font-body text-sm leading-[1.8] text-muted-foreground">
            {t("empty.hint")}
          </p>
          <Link
            href="/catalog"
            className="mt-1 flex min-h-[48px] items-center justify-center rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground"
          >
            {common("browseCollection")}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="text-sm text-muted-foreground">
              {t("count", { count: saved.length })}
            </div>
            <button
              type="button"
              onClick={clear}
              className="min-h-[44px] text-sm font-semibold text-primary"
            >
              {t("clearAll")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            {saved.map((product) => (
              <CatalogCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
