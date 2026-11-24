import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown, Search, SlidersHorizontal, Tags } from "lucide-react"

import {
  PRODUCT_SORTS,
  STOCK_FILTERS,
  VISIBILITY_FILTERS,
  productSortLabel,
  type ProductCategory,
  type ProductSort,
  type StockFilter,
  type StockState,
  type VisibilityFilter,
} from "@/lib/products"

type ProductFiltersProps = {
  query: string
  onQueryChange: (value: string) => void
  categories: readonly ProductCategory[]
  /** Category slug, or `"all"`. */
  category: string
  onCategoryChange: (value: string) => void
  sort: ProductSort
  onSortChange: (value: ProductSort) => void
  stock: StockFilter
  onStockChange: (value: StockFilter) => void
  /** Stock counts measured against the search and category, before the chip. */
  counts: Record<StockState, number>
  /** Products matching search and category. */
  total: number
  visibility: VisibilityFilter
  onVisibilityChange: (value: VisibilityFilter) => void
}

/** The 48px chips from the mock; the selected facet takes a 2px primary edge. */
function facetChipClass(selected: boolean) {
  return cn(
    "flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-card px-4 text-sm transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    selected ? "border-2 border-primary" : "border border-border"
  )
}

const chipBase =
  "flex min-h-11 items-center rounded-md px-4 text-sm font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

/**
 * Search, category, sort and the two chip rows.
 *
 * STOCK chips carry counts measured before the chip is applied, so they do not
 * all collapse to the selected one. SHOWING has no counts in the design — it is
 * a view selector, not a breakdown.
 */
export function ProductFilters({
  query,
  onQueryChange,
  categories,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  stock,
  onStockChange,
  counts,
  total,
  visibility,
  onVisibilityChange,
}: ProductFiltersProps) {
  const categoryLabel =
    categories.find((option) => option.slug === category)?.nameEn ??
    "All categories"

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex min-h-12 min-w-[220px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search name • ဂါဝန် / Dress…"
            aria-label="Search products by name, SKU or category"
            className="h-12 rounded-md border-border bg-background pr-3 pl-10 text-sm dark:bg-background"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={facetChipClass(category !== "all")}
            aria-label={`Category: ${categoryLabel}`}
          >
            <Tags className="size-4 shrink-0 text-primary" strokeWidth={3.2} />
            <span className="font-semibold text-foreground">
              {categoryLabel}
            </span>
            <ChevronDown
              className="size-[15px] shrink-0 text-muted-foreground"
              strokeWidth={3.2}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuRadioGroup
              value={category}
              onValueChange={onCategoryChange}
            >
              <DropdownMenuRadioItem value="all" label="All categories">
                All categories
              </DropdownMenuRadioItem>
              {categories.map((option) => (
                <DropdownMenuRadioItem
                  key={option.slug}
                  value={option.slug}
                  label={`${option.nameMy} • ${option.nameEn}`}
                >
                  {option.nameMy} • {option.nameEn}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={facetChipClass(sort !== "default")}
            aria-label={`Sort: ${productSortLabel(sort)}`}
          >
            <SlidersHorizontal
              className="size-[15px] shrink-0"
              strokeWidth={3.2}
            />
            <span className="font-semibold text-foreground">More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-56">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => onSortChange(value as ProductSort)}
            >
              {PRODUCT_SORTS.map((option) => (
                <DropdownMenuRadioItem
                  key={option.key}
                  value={option.key}
                  label={option.label}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground">STOCK:</span>
        {STOCK_FILTERS.map((option) => {
          const selected = stock === option.key
          const count = option.key === "all" ? total : counts[option.key]

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onStockChange(option.key)}
              className={cn(
                chipBase,
                selected
                  ? "border border-primary bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              {option.label} • {count}
            </button>
          )
        })}

        <span aria-hidden className="mx-1 h-6 w-px bg-border" />
        <span className="text-xs font-bold text-muted-foreground">
          SHOWING:
        </span>
        {VISIBILITY_FILTERS.map((option) => {
          const selected = visibility === option.key

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onVisibilityChange(option.key)}
              className={cn(
                chipBase,
                selected
                  ? "border border-primary bg-secondary text-secondary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
