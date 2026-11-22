"use client"

import { ChevronDown, Plus, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"

import { cn } from "@workspace/ui/lib/utils"

import CatalogCard from "@/components/catalog-card"
import CatalogHeader from "@/components/catalog-header"
import EmptyState from "@/components/empty-state"
import FilterSheet from "@/components/filter-sheet"
import {
  CATEGORIES,
  PRICE_RANGES,
  SORT_OPTIONS,
  filterProducts,
  searchProducts,
  sortProducts,
  toMyanmarDigits,
  type CatalogFilters,
  type CatalogProduct,
  type CatalogSort,
} from "@/components/catalog-data"
import { buildCatalogParams, type CatalogQuery } from "@/lib/catalog-query"

const PAGE_SIZE = 6

type CatalogViewProps = {
  products: CatalogProduct[]
  initial: CatalogQuery
}

export default function CatalogView({ products, initial }: CatalogViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(initial.q))
  const [searchText, setSearchText] = useState(initial.q)

  const { category, price, size, q, sort } = initial

  // Holds the query this view intends to show, so a filter change made while a
  // search navigation is still in flight does not drop the search term.
  const desiredQuery = useRef(initial)

  // The URL is the single source of truth, so deep links and the back button
  // both restore the exact view.
  const applyQuery = useCallback(
    (patch: Partial<CatalogQuery>) => {
      const next = { ...desiredQuery.current, ...patch }
      desiredQuery.current = next

      const params = buildCatalogParams(next)
      const queryString = params.toString()

      startTransition(() => {
        router.replace(queryString ? `/catalog?${queryString}` : "/catalog", {
          scroll: false,
        })
      })
    },
    [router]
  )

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [category, price, size, q, sort])

  useEffect(() => {
    // Keep the pending query aligned with filter links clicked elsewhere
    // (menu, footer). The search term is excluded because the input owns it.
    desiredQuery.current = {
      ...desiredQuery.current,
      category,
      price,
      size,
      sort,
    }
  }, [category, price, size, sort])

  useEffect(() => {
    const trimmed = searchText.trim()
    if (trimmed === q) return

    const timer = setTimeout(() => applyQuery({ q: trimmed }), 350)
    return () => clearTimeout(timer)
  }, [searchText, q, applyQuery])

  const results = useMemo(() => {
    const filtered = filterProducts(products, { category, price, size })

    return sortProducts(searchProducts(filtered, q), sort)
  }, [products, category, price, size, q, sort])

  const visible = results.slice(0, visibleCount)

  const categoryLabel = CATEGORIES.find((entry) => entry.id === category)
  const priceLabel = PRICE_RANGES.find((entry) => entry.id === price)

  const openFilters = useCallback(() => setIsFilterOpen(true), [])
  const closeFilters = useCallback(() => setIsFilterOpen(false), [])

  const applyFilters = useCallback(
    (next: CatalogFilters) => {
      applyQuery(next)
      setIsFilterOpen(false)
    },
    [applyQuery]
  )

  const clearFilters = useCallback(() => {
    setSearchText("")
    setIsSearchOpen(false)
    applyQuery({ category: null, price: null, size: null, q: "" })
  }, [applyQuery])

  const toggleSearch = useCallback(() => {
    if (isSearchOpen) {
      setSearchText("")
      setIsSearchOpen(false)
      if (q) applyQuery({ q: "" })
      return
    }

    setIsSearchOpen(true)
  }, [applyQuery, isSearchOpen, q])

  return (
    <>
      <CatalogHeader
        title={categoryLabel?.label ?? "ပစ္စည်းအားလုံး"}
        subtitle={`${categoryLabel?.en ?? "All items"} • ${toMyanmarDigits(
          results.length
        )} မျိုး`}
        search={{
          value: searchText,
          isOpen: isSearchOpen,
          onChange: setSearchText,
          onToggle: toggleSearch,
        }}
      />

      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        <FilterChip
          label={categoryLabel?.chip ?? "အမျိုးအစား"}
          active={Boolean(categoryLabel)}
          onClick={openFilters}
        />
        <FilterChip
          label={priceLabel ? `ဈေး • ${priceLabel.short}` : "ဈေး"}
          active={Boolean(priceLabel)}
          onClick={openFilters}
        />
        <FilterChip
          label={size ? `ဆိုဒ် • ${size}` : "ဆိုဒ်"}
          active={Boolean(size)}
          onClick={openFilters}
        />
        <button
          type="button"
          onClick={openFilters}
          className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground"
        >
          <SlidersHorizontal className="size-4" strokeWidth={3} />
          <span className="font-body">စစ်ရန်</span>
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {results.length}
          </span>{" "}
          မျိုး တွေ့ရှိပါတယ်
        </div>

        <div className="relative flex items-center text-sm text-muted-foreground">
          <label htmlFor="catalog-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) =>
              applyQuery({ sort: event.target.value as CatalogSort })
            }
            className="min-h-[44px] appearance-none rounded-md bg-transparent py-2 pr-6 pl-1 text-sm text-muted-foreground focus-visible:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-0 size-3.5"
            strokeWidth={3.4}
          />
        </div>
      </div>

      {q ? (
        <div className="px-4 pb-2 text-xs text-muted-foreground">
          “{q}” အတွက် ရှာဖွေမှု • Search results
        </div>
      ) : null}

      {results.length > 0 ? (
        <div
          aria-busy={isPending}
          className={cn(
            "grid grid-cols-2 gap-3 px-4 transition-opacity",
            isPending && "opacity-60"
          )}
        >
          {visible.map((product) => (
            <CatalogCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="px-4 pb-6">
          <EmptyState onClear={clearFilters} />
        </div>
      )}

      {results.length > 0 ? (
        <div className="px-4 pt-4 pb-6">
          {visibleCount < results.length ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md border border-border bg-card text-sm font-semibold text-primary"
            >
              <Plus className="size-4" strokeWidth={3} />
              နောက်ထပ် ပြမည်
            </button>
          ) : null}
          <div className="flex justify-center pt-2">
            <div className="flex h-1.5 w-32 overflow-hidden rounded-sm bg-secondary">
              <div
                className="h-full rounded-sm bg-primary"
                style={{
                  width: `${(visible.length / results.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="pt-1 text-center text-xs text-muted-foreground">
            {visible.length} of {results.length} shown
          </div>
        </div>
      ) : null}

      {isFilterOpen ? (
        <FilterSheet
          products={products}
          initialFilters={{ category, price, size }}
          onApply={applyFilters}
          onClose={closeFilters}
        />
      ) : null}
    </>
  )
}

type FilterChipProps = {
  label: string
  active: boolean
  onClick: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={cn(
        "flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-md px-4 text-sm",
        active
          ? "bg-primary font-semibold text-primary-foreground"
          : "border border-border bg-card font-medium text-foreground"
      )}
    >
      <span className="font-body leading-[1.7]">{label}</span>
      <ChevronDown
        className={cn("size-[15px]", !active && "text-muted-foreground")}
        strokeWidth={3.2}
      />
    </button>
  )
}
