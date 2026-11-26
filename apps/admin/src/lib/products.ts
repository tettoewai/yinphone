/**
 * Presentation types and metadata behind `/products`.
 *
 * The list itself now comes from `GET /api/admin/products`, which owns search,
 * filtering, sorting and paging, so this module holds only what the screen needs
 * to render: the row shape, the chip labels, the sort options and the undo
 * banner's change record. Nothing here imports React.
 */

import type { AdminProductSummary } from "@/lib/api"

/** A category as the filter dropdown and the product form draw it. */
export type ProductCategory = {
  slug: string
  nameMy: string
  nameEn: string
}

/**
 * The shop's categories for the product form. The list screen reads the real
 * `GET /api/admin/categories`; this literal stays until the form is wired.
 */
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  { slug: "dresses", nameMy: "ဂါဝန်", nameEn: "Dresses" },
  { slug: "tops", nameMy: "အပေါ်ထပ်", nameEn: "Tops" },
  { slug: "skirts", nameMy: "စကတ်", nameEn: "Skirts" },
  { slug: "trousers", nameMy: "ဘောင်းဘီ", nameEn: "Trousers" },
]

/** One row of the products table. `GET /api/admin/products` returns this shape. */
export type ProductSummary = AdminProductSummary

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

/**
 * The undoable change the banner reports. Hiding PATCHes the row back to active;
 * duplicating DELETEs the copy it created.
 */
export type ProductChange =
  | { kind: "hidden"; id: string; name: string }
  | { kind: "duplicated"; id: string; name: string }

/** Rows per page in the design's footer ("1–5 of 24 • Page 1/5"). */
export const PRODUCTS_PAGE_SIZE = 5

/** Undo window after hiding or duplicating, matching the orders screen. */
export const UNDO_SECONDS = 10
