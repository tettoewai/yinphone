/**
 * Placeholder rows for `/products`, shaped like the API's Prisma models.
 *
 * The mock numbers its stock to agree with the design's chips — 24 items split
 * 16 in stock / 5 low / 3 out — and starts with the same five rows, in the same
 * order, so "page 1 of SHOWING → Active" is the design's table. Three of the
 * later rows are inactive, which is what the SHOWING → Hidden chip counts.
 *
 * Swapping this file for a `GET /api/products` response is the only change the
 * page needs.
 */

import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductSummary,
} from "@/lib/products"

/** Category keys used by the rows below; the API stores the full record. */
type CategoryKey = "dresses" | "tops" | "skirts" | "trousers"

/**
 * Keyed view of `PRODUCT_CATEGORIES`, so a row names its category with a
 * checked literal rather than an index that `noUncheckedIndexedAccess` would
 * widen to `undefined`.
 */
const CATEGORIES = Object.fromEntries(
  PRODUCT_CATEGORIES.map((category) => [category.slug, category])
) as Record<CategoryKey, ProductCategory>

type MockProduct = Omit<ProductSummary, "id" | "category"> & {
  category: CategoryKey
}

/**
 * Newest first. `stock` and `isActive` are counted by the chips, so keep the
 * 16/5/3 split and the three hidden rows when editing this list.
 */
const ROWS: readonly MockProduct[] = [
  {
    slug: "cotton-midi-dress",
    sku: "DR-014",
    nameMy: "ချည်သား Midi ဂါဝန်",
    nameEn: "Cotton Midi Dress",
    category: "dresses",
    priceMmk: 45_000,
    stock: 12,
    isActive: true,
  },
  {
    slug: "knit-cardigan",
    sku: "KN-008",
    nameMy: "ဆွယ်တာ Cardigan",
    nameEn: "Knit Cardigan",
    category: "tops",
    priceMmk: 45_000,
    stock: 4,
    isActive: true,
  },
  {
    slug: "floral-summer-dress",
    sku: "DR-021",
    nameMy: "Floral Summer ဂါဝန်",
    nameEn: "Floral Summer Dress",
    category: "dresses",
    priceMmk: 39_500,
    stock: 0,
    isActive: true,
  },
  {
    slug: "pleated-skirt",
    sku: "SK-011",
    nameMy: "Pleated စကတ်",
    nameEn: "Pleated Skirt",
    category: "skirts",
    priceMmk: 32_000,
    stock: 18,
    isActive: true,
  },
  {
    slug: "cotton-blouse",
    sku: "TP-005",
    nameMy: "ချည်သား Blouse အဖြူ",
    nameEn: "Cotton Blouse",
    category: "tops",
    priceMmk: 28_500,
    stock: 2,
    isActive: true,
  },
  {
    slug: "silk-slip-dress",
    sku: "DR-018",
    nameMy: "ပိုးသား ဂါဝန်",
    nameEn: "Silk Slip Dress",
    category: "dresses",
    priceMmk: 52_000,
    stock: 8,
    isActive: true,
  },
  {
    slug: "linen-shirt",
    sku: "TP-012",
    nameMy: "ချည်သား အင်္ကျီ",
    nameEn: "Linen Shirt",
    category: "tops",
    priceMmk: 26_000,
    stock: 6,
    isActive: true,
  },
  {
    slug: "cotton-skirt",
    sku: "SK-004",
    nameMy: "ချည်သား စကတ်",
    nameEn: "Cotton Skirt",
    category: "skirts",
    priceMmk: 30_000,
    stock: 9,
    isActive: true,
  },
  {
    slug: "wide-leg-trousers",
    sku: "TR-002",
    nameMy: "ချည်သား ဘောင်းဘီ",
    nameEn: "Wide-leg Trousers",
    category: "trousers",
    priceMmk: 42_000,
    stock: 11,
    isActive: true,
  },
  {
    slug: "embroidered-dress",
    sku: "DR-009",
    nameMy: "ပန်းထိုး ဂါဝန်",
    nameEn: "Embroidered Dress",
    category: "dresses",
    priceMmk: 48_000,
    stock: 3,
    isActive: true,
  },
  {
    slug: "ribbed-knit-top",
    sku: "TP-017",
    nameMy: "ကုတ်အင်္ကျီ",
    nameEn: "Ribbed Knit Top",
    category: "tops",
    priceMmk: 24_500,
    stock: 7,
    isActive: true,
  },
  {
    slug: "wool-cardigan",
    sku: "KN-013",
    nameMy: "သိုးမွှေး Cardigan",
    nameEn: "Wool Cardigan",
    category: "tops",
    priceMmk: 55_000,
    stock: 14,
    isActive: true,
  },
  {
    slug: "denim-skirt",
    sku: "SK-019",
    nameMy: "ဂျင်းစကတ်",
    nameEn: "Denim Skirt",
    category: "skirts",
    priceMmk: 35_000,
    stock: 1,
    isActive: true,
  },
  {
    slug: "cotton-shorts",
    sku: "TR-006",
    nameMy: "ချည်သား ဘောင်းဘီတို",
    nameEn: "Cotton Shorts",
    category: "trousers",
    priceMmk: 38_000,
    stock: 0,
    isActive: false,
  },
  {
    slug: "occasion-dress",
    sku: "DR-025",
    nameMy: "ပွဲလမ်း ဂါဝန်",
    nameEn: "Occasion Dress",
    category: "dresses",
    priceMmk: 58_000,
    stock: 5,
    isActive: true,
  },
  {
    slug: "silk-blouse",
    sku: "TP-021",
    nameMy: "ပိုးသား Blouse",
    nameEn: "Silk Blouse",
    category: "tops",
    priceMmk: 27_000,
    stock: 10,
    isActive: true,
  },
  {
    slug: "silk-skirt",
    sku: "SK-008",
    nameMy: "ပိုးသား စကတ်",
    nameEn: "Silk Skirt",
    category: "skirts",
    priceMmk: 31_500,
    stock: 2,
    isActive: true,
  },
  {
    slug: "everyday-dress",
    sku: "DR-030",
    nameMy: "နေ့စဉ် ဂါဝန်",
    nameEn: "Everyday Dress",
    category: "dresses",
    priceMmk: 62_000,
    stock: 6,
    isActive: false,
  },
  {
    slug: "tailored-trousers",
    sku: "TR-014",
    nameMy: "ချည်သား ဘောင်းဘီရှည်",
    nameEn: "Tailored Trousers",
    category: "trousers",
    priceMmk: 44_000,
    stock: 6,
    isActive: true,
  },
  {
    slug: "cotton-tee",
    sku: "TP-009",
    nameMy: "ချည်သား တီရှပ်",
    nameEn: "Cotton Tee",
    category: "tops",
    priceMmk: 22_500,
    stock: 16,
    isActive: true,
  },
  {
    slug: "wrap-skirt",
    sku: "SK-022",
    nameMy: "ခေါက်စကတ်",
    nameEn: "Wrap Skirt",
    category: "skirts",
    priceMmk: 29_000,
    stock: 0,
    isActive: false,
  },
  {
    slug: "cotton-day-dress",
    sku: "DR-011",
    nameMy: "ချည်သား နေ့ဂါဝန်",
    nameEn: "Cotton Day Dress",
    category: "dresses",
    priceMmk: 49_000,
    stock: 13,
    isActive: true,
  },
  {
    slug: "oversized-shirt",
    sku: "TP-024",
    nameMy: "ကော်တွန် အင်္ကျီ",
    nameEn: "Oversized Shirt",
    category: "tops",
    priceMmk: 33_000,
    stock: 8,
    isActive: true,
  },
  {
    slug: "cotton-cardigan",
    sku: "KN-017",
    nameMy: "ချည်သား Cardigan",
    nameEn: "Cotton Cardigan",
    category: "tops",
    priceMmk: 51_000,
    stock: 15,
    isActive: true,
  },
]

export const PRODUCTS_MOCK: readonly ProductSummary[] = ROWS.map(
  ({ category, ...product }) => ({
    ...product,
    id: `prd_${product.slug}`,
    category: CATEGORIES[category],
  })
)
