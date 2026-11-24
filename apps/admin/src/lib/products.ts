/**
 * Product-list types and the pure helpers behind `/products`.
 *
 * `ProductSummary` mirrors the API's Prisma `Product` row with its category
 * folded in (`apps/api/prisma/schema.prisma`), so `products-mock.ts` can be
 * swapped for a `GET /api/products` response without touching a component. Two
 * fields go beyond the current schema on purpose: `sku` is the short code the
 * shop quotes (`DR-014`) and `slug` is what the storefront link is built from.
 * Neither is invented at render time.
 *
 * Nothing here imports React — filtering, counting, sorting, duplicating and
 * paging are plain functions over arrays.
 */

export type ProductCategory = {
  slug: string
  nameMy: string
  nameEn: string
}

/** One row of the products table. A real endpoint returns this shape. */
export type ProductSummary = {
  id: string
  slug: string
  /** Short shop code, e.g. `DR-014`. */
  sku: string
  nameMy: string
  nameEn: string
  category: ProductCategory
  priceMmk: number
  stock: number
  /** Cleared when the product is hidden from staff and shoppers. */
  isActive: boolean
}

/** Stock below this reads as "Low" on the stock chips. */
export const LOW_STOCK_THRESHOLD = 5

export type StockState = "in" | "low" | "out"

export function stockState(stock: number): StockState {
  if (stock <= 0) return "out"
  return stock < LOW_STOCK_THRESHOLD ? "low" : "in"
}

/** `"all"` is the unfiltered value for each facet. */
export type StockFilter = "all" | StockState

export const STOCK_FILTERS: readonly { key: StockFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in", label: "In stock" },
  { key: "low", label: `Low < ${LOW_STOCK_THRESHOLD}` },
  { key: "out", label: "Out" },
]

/**
 * What the SHOWING chips select. Hidden products are kept — they stay on past
 * orders and can be turned back on — so this is a view, not a delete.
 */
export type VisibilityFilter = "active" | "hidden" | "all"

export const VISIBILITY_FILTERS: readonly {
  key: VisibilityFilter
  label: string
}[] = [
  { key: "active", label: "Active" },
  { key: "hidden", label: "Hidden" },
  { key: "all", label: "All" },
]

export type ProductSort = "default" | "price-asc" | "price-desc" | "stock-asc"

export const PRODUCT_SORTS: readonly { key: ProductSort; label: string }[] = [
  { key: "default", label: "Default order" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "stock-asc", label: "Stock: low to high" },
]

export function productSortLabel(sort: ProductSort) {
  return (
    PRODUCT_SORTS.find((option) => option.key === sort)?.label ??
    "Default order"
  )
}

/** Filter selections for the two facets that narrow the list before counting. */
export type ProductFilters = {
  query: string
  /** Category slug, or `"all"`. */
  category: string
}

/**
 * Matches the search box: either name, the SKU, or the category. Shoppers and
 * staff both quote the Latin name, so both names are searched.
 */
export function matchesProductQuery(product: ProductSummary, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return (
    product.nameMy.toLowerCase().includes(needle) ||
    product.nameEn.toLowerCase().includes(needle) ||
    product.sku.toLowerCase().includes(needle) ||
    product.category.nameMy.toLowerCase().includes(needle) ||
    product.category.nameEn.toLowerCase().includes(needle)
  )
}

/**
 * Applies search and category. The stock chips count against this result, so
 * their numbers do not collapse to the selected chip once one is chosen.
 */
export function filterProducts(
  products: readonly ProductSummary[],
  filters: ProductFilters
) {
  return products.filter(
    (product) =>
      (filters.category === "all" ||
        product.category.slug === filters.category) &&
      matchesProductQuery(product, filters.query)
  )
}

export function stockCounts(
  products: readonly ProductSummary[]
): Record<StockState, number> {
  const counts: Record<StockState, number> = { in: 0, low: 0, out: 0 }

  for (const product of products) {
    counts[stockState(product.stock)] += 1
  }

  return counts
}

export function filterByStock(
  products: readonly ProductSummary[],
  stock: StockFilter
) {
  if (stock === "all") return products
  return products.filter((product) => stockState(product.stock) === stock)
}

export function matchesVisibility(
  product: ProductSummary,
  visibility: VisibilityFilter
) {
  if (visibility === "all") return true
  return visibility === "active" ? product.isActive : !product.isActive
}

export function sortProducts(
  products: readonly ProductSummary[],
  sort: ProductSort
) {
  if (sort === "default") return products

  const rows = [...products]

  switch (sort) {
    case "price-asc":
      return rows.sort((a, b) => a.priceMmk - b.priceMmk)
    case "price-desc":
      return rows.sort((a, b) => b.priceMmk - a.priceMmk)
    case "stock-asc":
      return rows.sort((a, b) => a.stock - b.stock)
  }
}

/** The categories present in the list, ordered by their Latin name. */
export function categoryOptions(
  products: readonly ProductSummary[]
): ProductCategory[] {
  const bySlug = new Map<string, ProductCategory>()

  for (const product of products) {
    bySlug.set(product.category.slug, product.category)
  }

  return [...bySlug.values()].sort((a, b) => a.nameEn.localeCompare(b.nameEn))
}

/**
 * A hidden draft that mirrors `product`. Copies land inactive so a half-edited
 * product never reaches shoppers; `serial` only has to keep the ids unique for
 * the life of the page.
 */
export function copyOfProduct(
  product: ProductSummary,
  serial: number
): ProductSummary {
  return {
    ...product,
    id: `${product.id}-copy-${serial}`,
    slug: `${product.slug}-copy-${serial}`,
    sku: `${product.sku}-C${serial}`,
    nameMy: `${product.nameMy} (မိတ္တူ)`,
    nameEn: `${product.nameEn} (copy)`,
    isActive: false,
  }
}

/**
 * The undoable change the banner reports. Mutations are local state until the
 * products API exists, so the banner is the only record of what just happened.
 */
export type ProductChange =
  | { kind: "hidden"; id: string; name: string }
  | { kind: "duplicated"; id: string; name: string }

/** Rows per page in the design's footer ("1–5 of 24 • Page 1/5"). */
export const PRODUCTS_PAGE_SIZE = 5

/** Undo window after hiding or duplicating, matching the orders screen. */
export const UNDO_SECONDS = 10
