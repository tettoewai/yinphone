/**
 * Client for the Nest API in `apps/api`.
 *
 * Catalog reads run inside Server Components; `createOrder` runs in the
 * browser when the customer picks a chat channel. Neither needs credentials,
 * so this module is safe to import from either side.
 */

/** Base URL of the API. Falls back to the local dev server. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export type ApiProductImage = {
  id: string
  url: string
  altText: string | null
}

export type ApiCategory = {
  id: string
  slug: string
  nameMy: string
  nameEn: string
  sortOrder: number
  productCount: number
}

export type ApiProduct = {
  id: string
  slug: string
  nameMy: string
  nameEn: string
  descriptionMy: string | null
  descriptionEn: string | null
  priceMmk: number
  stock: number
  sizes: string[]
  isActive: boolean
  createdAt: string
  inStock: boolean
  category: { id: string; slug: string; nameMy: string; nameEn: string }
  images: ApiProductImage[]
}

export type ApiProductList = {
  items: ApiProduct[]
  total: number
  limit: number
  offset: number
}

export type ProductQuery = {
  category?: string
  q?: string
  size?: string
  sort?: "newest" | "price-asc" | "price-desc"
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

export type CreateOrderItemInput = {
  productId: string
  quantity: number
  size?: string
}

export type CreateOrderInput = {
  customerName: string
  customerPhone: string
  channel: string
  note?: string
  items: CreateOrderItemInput[]
}

export type ApiOrder = {
  code: string
  status: string
  totalMmk: number
  note: string | null
  createdAt: string
  channel: { slug: string; nameMy: string; nameEn: string }
  items: {
    productId: string
    size: string | null
    nameMy: string
    nameEn: string
    quantity: number
    unitPriceMmk: number
    lineTotalMmk: number
  }[]
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`GET ${path} failed (${response.status})`)
  }

  return (await response.json()) as T
}

/**
 * Products matching `query`, newest first unless `sort` says otherwise.
 * The storefront filters the returned page in the browser, so unresolved
 * filters default to a single page large enough for the whole catalogue.
 */
export async function fetchProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams()

  if (query.category) params.set("category", query.category)
  if (query.q) params.set("q", query.q)
  if (query.size) params.set("size", query.size)
  if (query.sort) params.set("sort", query.sort)
  if (query.minPrice !== undefined) {
    params.set("minPrice", String(query.minPrice))
  }
  if (query.maxPrice !== undefined) {
    params.set("maxPrice", String(query.maxPrice))
  }
  if (query.limit !== undefined) params.set("limit", String(query.limit))
  if (query.offset !== undefined) params.set("offset", String(query.offset))

  const search = params.toString()
  const payload = await getJson<ApiProductList>(
    `/api/products${search ? `?${search}` : ""}`
  )

  return payload.items
}

/** A single product by slug, or `null` when the API has no such product. */
export async function fetchProduct(slug: string): Promise<ApiProduct | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/products/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  )

  if (response.status === 404) return null

  if (!response.ok) {
    throw new Error(`GET /api/products/${slug} failed (${response.status})`)
  }

  return (await response.json()) as ApiProduct
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  return getJson<ApiCategory[]>("/api/categories")
}

/** Registers the order so the shop sees it before the chat message arrives. */
export async function createOrder(input: CreateOrderInput): Promise<ApiOrder> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`POST /api/orders failed (${response.status})`)
  }

  return (await response.json()) as ApiOrder
}
