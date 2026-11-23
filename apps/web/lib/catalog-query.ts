import {
  DEFAULT_CATALOG_SORT,
  PRICE_RANGES,
  SIZES,
  SORT_OPTIONS,
  type CatalogFilters,
  type CatalogSort,
} from "@/components/catalog-data"

export type CatalogQuery = CatalogFilters & {
  q: string
  sort: CatalogSort
}

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  category: null,
  price: null,
  size: null,
  q: "",
  sort: DEFAULT_CATALOG_SORT,
}

type RawSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

/**
 * Parses untrusted URL params into a valid catalog query. Categories come from
 * the API, so anything not in `categorySlugs` is dropped.
 */
export function parseCatalogQuery(
  params: RawSearchParams,
  categorySlugs: string[]
): CatalogQuery {
  const categoryValue = firstValue(params.category)
  const priceValue = firstValue(params.price)
  const sizeValue = firstValue(params.size)
  const sortValue = firstValue(params.sort)

  return {
    category: categorySlugs.includes(categoryValue) ? categoryValue : null,
    price: PRICE_RANGES.find((entry) => entry.id === priceValue)?.id ?? null,
    size: SIZES.find((entry) => entry === sizeValue) ?? null,
    q: firstValue(params.q).trim().slice(0, 60),
    sort:
      SORT_OPTIONS.find((entry) => entry.id === sortValue)?.id ??
      DEFAULT_CATALOG_QUERY.sort,
  }
}

export function buildCatalogParams(query: CatalogQuery) {
  const params = new URLSearchParams()

  if (query.category) params.set("category", query.category)
  if (query.price) params.set("price", query.price)
  if (query.size) params.set("size", query.size)
  if (query.q) params.set("q", query.q)
  if (query.sort !== DEFAULT_CATALOG_SORT) params.set("sort", query.sort)

  return params
}
