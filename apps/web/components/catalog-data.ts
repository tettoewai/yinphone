import type { Locale } from "next-intl"

import type { ApiCategory, ApiProduct } from "@/lib/api"

export const MESSENGER_URL = "https://m.me/yinphoneboutique"

export const SIZES = ["S", "M", "L", "XL"] as const

export type SizeId = (typeof SIZES)[number]

export type PriceId = "under-35k" | "35k-50k" | "over-50k"

export type CatalogSort = "newest" | "price-asc" | "price-desc"

export type CatalogFilters = {
  /** Category slug as stored in the database, e.g. `dresses-sets`. */
  category: string | null
  price: PriceId | null
  size: SizeId | null
}

/** Category row from `/api/categories`, shaped for the filter UI. */
export type CatalogCategory = {
  id: string
  slug: string
  /** Name in the active locale. */
  name: string
  productCount: number
}

export type CatalogProduct = {
  /** Slug — the public identifier, used in URLs and favourites. */
  id: string
  /** Database id, required by the orders API. */
  productId: string
  image: string
  alt: string
  /** Name in the active locale. */
  title: string
  /**
   * Name in the other locale. Never rendered — it is kept so a search in
   * either language still finds the piece.
   */
  subtitle: string
  /** Myanmar name, always. The shop-facing order payload is never translated. */
  shopTitle: string
  price: number
  /** Category slug. */
  category: string
  sizes: SizeId[]
  badge?: string
  compareAtPrice?: number
  stockLeft?: number
  soldOut?: boolean
}

/** Bounds only; the labels live in the message catalogues. */
export const PRICE_RANGES: {
  id: PriceId
  min: number
  max: number | null
}[] = [
  { id: "under-35k", min: 20000, max: 35000 },
  { id: "35k-50k", min: 35000, max: 50000 },
  { id: "over-50k", min: 50000, max: null },
]

export const DEFAULT_CATALOG_SORT: CatalogSort = "newest"

/** Sort order as it appears in the picker; labels come from messages. */
export const SORT_OPTIONS: CatalogSort[] = ["newest", "price-asc", "price-desc"]

/**
 * Shown when a product has no photo yet. A PNG, not the brand SVG: next/image
 * refuses to optimise `image/svg+xml` sources unless `dangerouslyAllowSVG` is
 * turned on, which would be a bad trade for a placeholder.
 */
const FALLBACK_IMAGE = "/product-placeholder.png"

/**
 * Curated home-page selection, in the order they should appear. The API has no
 * "featured" flag, so the shop curates the grid here.
 */
const FEATURED_SLUGS = [
  "classic-cotton-yin-phone",
  "silk-blend-longyi-gold",
  "floral-midi-dress",
  "linen-wrap-dress",
]

function isSizeId(value: string): value is SizeId {
  return (SIZES as readonly string[]).includes(value)
}

/** Picks the field for the active locale, falling back to the other one. */
function localized(my: string, en: string, locale: Locale) {
  return locale === "my" ? my || en : en || my
}

/** Maps a product from the API onto the shape the storefront renders. */
export function toCatalogProduct(
  product: ApiProduct,
  locale: Locale
): CatalogProduct {
  const image = product.images[0]
  const title = localized(product.nameMy, product.nameEn, locale)

  return {
    id: product.slug,
    productId: product.id,
    image: image?.url ?? FALLBACK_IMAGE,
    alt: image?.altText ?? title,
    title,
    subtitle: localized(product.nameEn, product.nameMy, locale),
    shopTitle: product.nameMy || product.nameEn,
    price: product.priceMmk,
    category: product.category.slug,
    sizes: product.sizes.filter(isSizeId),
    stockLeft: product.stock,
    soldOut: !product.inStock,
  }
}

export function toCatalogCategory(
  category: ApiCategory,
  locale: Locale
): CatalogCategory {
  return {
    id: category.id,
    slug: category.slug,
    name: localized(category.nameMy, category.nameEn, locale),
    productCount: category.productCount,
  }
}

/** Home-page grid: the curated slugs that are still in the catalogue. */
export function pickFeatured(products: CatalogProduct[]): CatalogProduct[] {
  const bySlug = new Map(products.map((product) => [product.id, product]))

  return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (product): product is CatalogProduct => Boolean(product)
  )
}

/** Saved-items grid: favourites in catalogue order. */
export function pickByIds(
  products: CatalogProduct[],
  ids: string[]
): CatalogProduct[] {
  const wanted = new Set(ids)

  return products.filter((product) => wanted.has(product.id))
}

export function filterProducts(
  products: CatalogProduct[],
  filters: CatalogFilters
): CatalogProduct[] {
  return products.filter((product) => {
    const matchesCategory =
      filters.category === null || product.category === filters.category

    const range = PRICE_RANGES.find((entry) => entry.id === filters.price)
    const matchesPrice =
      !range ||
      (product.price >= range.min &&
        (range.max === null || product.price < range.max))

    const matchesSize =
      filters.size === null || product.sizes.includes(filters.size)

    return matchesCategory && matchesPrice && matchesSize
  })
}

export function searchProducts(
  products: CatalogProduct[],
  query: string
): CatalogProduct[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return products

  // `subtitle` is the other locale's name, so a search in either language hits.
  return products.filter((product) =>
    [product.title, product.subtitle, product.id, product.shopTitle].some(
      (value) => value.toLowerCase().includes(needle)
    )
  )
}

export function sortProducts(
  products: CatalogProduct[],
  sort: CatalogSort
): CatalogProduct[] {
  if (sort === "price-asc") {
    return [...products].sort((a, b) => a.price - b.price)
  }

  if (sort === "price-desc") {
    return [...products].sort((a, b) => b.price - a.price)
  }

  return products
}
