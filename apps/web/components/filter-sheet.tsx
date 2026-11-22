"use client"

import { Check } from "lucide-react"
import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import BottomSheet from "@/components/bottom-sheet"
import {
  CATEGORIES,
  PRICE_RANGES,
  SIZES,
  filterProducts,
  toMyanmarDigits,
  type CatalogFilters,
  type CatalogProduct,
  type CategoryId,
  type PriceId,
  type SizeId,
} from "@/components/catalog-data"

const EMPTY_DRAFT: CatalogFilters = { category: null, price: null, size: null }

type FilterSheetProps = {
  products: CatalogProduct[]
  initialFilters: CatalogFilters
  onApply: (filters: CatalogFilters) => void
  onClose: () => void
}

export default function FilterSheet({
  products,
  initialFilters,
  onApply,
  onClose,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<CatalogFilters>(initialFilters)
  const resultCount = filterProducts(products, draft).length

  function toggleCategory(id: CategoryId) {
    setDraft((current) => ({
      ...current,
      category: current.category === id ? null : id,
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
      title="စစ်ထုတ်ရန်"
      description="Filter products"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="min-h-[48px] flex-1 rounded-md border border-border bg-card font-body text-sm font-semibold text-foreground"
          >
            ရှင်းလင်းမည်
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="min-h-[48px] flex-[2] rounded-md bg-accent text-sm font-bold text-accent-foreground"
          >
            ရလဒ် {toMyanmarDigits(resultCount)} ခု ပြမည်
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-4 pb-1">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-foreground">Category</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const selected = draft.category === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "flex min-h-[44px] items-center rounded-md px-4 font-body text-sm",
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "border border-border bg-card font-medium text-foreground"
                  )}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-foreground">
            Price (MMK)
          </div>
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map((range) => {
              const selected = draft.price === range.id
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
                  <span>{range.label}</span>
                  {selected ? (
                    <Check className="size-4 text-primary" strokeWidth={3} />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-foreground">Size</div>
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
