"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import BottomSheet from "@/components/bottom-sheet"
import {
  PRICE_RANGES,
  SIZES,
  filterProducts,
  type CatalogCategory,
  type CatalogFilters,
  type CatalogProduct,
  type PriceId,
  type SizeId,
} from "@/components/catalog-data"

const EMPTY_DRAFT: CatalogFilters = { category: null, price: null, size: null }

type FilterSheetProps = {
  products: CatalogProduct[]
  categories: CatalogCategory[]
  initialFilters: CatalogFilters
  onApply: (filters: CatalogFilters) => void
  onClose: () => void
}

export default function FilterSheet({
  products,
  categories,
  initialFilters,
  onApply,
  onClose,
}: FilterSheetProps) {
  const t = useTranslations("Catalog.filterSheet")
  const ranges = useTranslations("Catalog.priceRanges")
  const [draft, setDraft] = useState<CatalogFilters>(initialFilters)
  const resultCount = filterProducts(products, draft).length

  function toggleCategory(slug: string) {
    setDraft((current) => ({
      ...current,
      category: current.category === slug ? null : slug,
    }))
  }

  function togglePrice(id: PriceId) {
    setDraft((current) => ({
      ...current,
      price: current.price === id ? null : id,
    }))
  }

  function toggleSize(id: SizeId) {
    setDraft((current) => ({
      ...current,
      size: current.size === id ? null : id,
    }))
  }

  return (
    <BottomSheet
      title={t("title")}
      description={t("description")}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="min-h-[48px] flex-1 rounded-md border border-border bg-card font-body text-sm font-semibold text-foreground"
          >
            {t("clear")}
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="min-h-[48px] flex-[2] rounded-md bg-accent text-sm font-bold text-accent-foreground"
          >
            {t("apply", { count: resultCount })}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-4 pb-1">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-foreground">
            {t("category")}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = draft.category === category.slug
              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.slug)}
                  className={cn(
                    "flex min-h-[44px] items-center rounded-md px-4 font-body text-sm",
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "border border-border bg-card font-medium text-foreground"
                  )}
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-foreground">
            {t("price")}
          </div>
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map((range) => {
              const selected = draft.price === range.id
              const label =
                range.id === "over-50k"
                  ? ranges("above", { min: range.min })
                  : ranges("between", {
                      min: range.min,
                      max: range.max ?? range.min,
                    })

              return (
                <button
                  key={range.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePrice(range.id)}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-md px-3 text-sm",
                    selected
                      ? "border border-primary bg-secondary font-semibold text-primary"
                      : "border border-border bg-card text-foreground"
                  )}
                >
                  <span>{label}</span>
                  {selected ? (
                    <Check className="size-4 text-primary" strokeWidth={3} />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-foreground">
            {t("size")}
          </div>
          <div className="flex gap-2">
            {SIZES.map((size) => {
              const selected = draft.size === size
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    "flex min-h-[44px] flex-1 items-center justify-center rounded-md text-sm font-semibold",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
