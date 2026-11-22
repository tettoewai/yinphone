export const MESSENGER_URL = "https://m.me/yinphoneboutique"

export const SIZES = ["S", "M", "L", "XL"] as const

export type SizeId = (typeof SIZES)[number]

export type CategoryId = "dresses" | "tops" | "bags" | "sale"

export type PriceId = "under-35k" | "35k-50k" | "over-50k"

export type CatalogSort = "newest" | "price-asc" | "price-desc"

export type CatalogFilters = {
  category: CategoryId | null
  price: PriceId | null
  size: SizeId | null
}

export type CatalogProduct = {
  id: string
  image: string
  alt: string
  title: string
  subtitle: string
  price: number
  category: Exclude<CategoryId, "sale">
  sizes: SizeId[]
  badge?: string
  compareAtPrice?: number
  stockLeft?: number
  isNew?: boolean
  onSale?: boolean
  soldOut?: boolean
}

export const CATEGORIES: {
  id: CategoryId
  label: string
  chip: string
  en: string
}[] = [
  { id: "dresses", label: "ဂါဝန်များ", chip: "ဂါဝန်", en: "Dresses" },
  { id: "tops", label: "အင်္ကျီများ", chip: "အင်္ကျီ", en: "Tops" },
  { id: "bags", label: "အိတ်များ", chip: "အိတ်", en: "Bags" },
  { id: "sale", label: "လျှော့ဈေး", chip: "လျှော့ဈေး", en: "Sale" },
]

export const PRICE_RANGES: {
  id: PriceId
  label: string
  short: string
  min: number
  max: number | null
}[] = [
  {
    id: "under-35k",
    label: "20,000 – 35,000 Ks",
    short: "20k–35k",
    min: 20000,
    max: 35000,
  },
  {
    id: "35k-50k",
    label: "35,000 – 50,000 Ks",
    short: "35k–50k",
    min: 35000,
    max: 50000,
  },
  {
    id: "over-50k",
    label: "50,000 Ks အထက်",
    short: "50k+",
    min: 50000,
    max: null,
  },
]

export const DEFAULT_CATALOG_SORT: CatalogSort = "newest"

export const SORT_OPTIONS: {
  id: CatalogSort
  label: string
  short: string
}[] = [
  { id: "newest", label: "အသစ်ဆုံး", short: "Newest" },
  { id: "price-asc", label: "ဈေးနည်းမှ မြင့်", short: "Price ↑" },
  { id: "price-desc", label: "ဈေးမြင့်မှ နည်း", short: "Price ↓" },
]

export const PRODUCTS: CatalogProduct[] = [
  {
    id: "peach-midi",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/059b6406-b9d4-4d5e-a538-c706c1da5fbb.jpg",
    alt: "Young woman in a pastel peach cotton midi dress in a warm boutique",
    title: "ချည်သား Midi ဂါဝန် - Peach",
    subtitle: "Cotton Midi Dress",
    price: 45000,
    category: "dresses",
    sizes: ["S", "M", "L"],
    badge: "New",
    compareAtPrice: 52000,
    stockLeft: 2,
    isNew: true,
  },
  {
    id: "woven-blouse",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/0544fcae-08fc-4a89-81c7-8a6ca61a6f2e.jpg",
    alt: "Folded white cotton blouse with traditional weaving detail on a hanger",
    title: "ရိုးရာ Blouse အဖြူ",
    subtitle: "Woven-Trim Blouse",
    price: 32500,
    category: "dresses",
    sizes: ["S", "M"],
    badge: "New",
    isNew: true,
  },
  {
    id: "linen-day-dress",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/d9754180-1182-4855-9289-dde731399b03.jpg",
    alt: "Woman wearing a sage green linen dress on a Yangon street",
    title: "Linen ဂါဝန် - အစိမ်းနု",
    subtitle: "Linen Day Dress",
    price: 48000,
    category: "dresses",
    sizes: ["M", "L"],
    isNew: true,
  },
  {
    id: "floral-summer",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/fa370fbd-6b91-4bf3-aa57-597f5e596b81.jpg",
    alt: "Floral summer dress on a hanger in a warm boutique",
    title: "Floral Summer ဂါဝန်",
    subtitle: "Floral Summer Dress",
    price: 39500,
    category: "dresses",
    sizes: ["S", "M", "L"],
    soldOut: true,
  },
  {
    id: "knit-cardigan",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/993f77cd-0d98-4403-a4ee-ce0da06e484f.jpg",
    alt: "Beige knit cardigan laid over a cotton dress",
    title: "Knit Cardigan - Beige",
    subtitle: "Soft Knit Cardigan",
    price: 36000,
    category: "dresses",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "teal-longyi",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/3d06911f-fd70-40dd-9e40-1b9ef5147616.jpg",
    alt: "Dark teal longyi skirt with a cotton top on a boutique mannequin",
    title: "Teal Longyi Set",
    subtitle: "Longyi Co-ord Set",
    price: 52000,
    category: "dresses",
    sizes: ["M", "L"],
    soldOut: true,
  },
  {
    id: "beige-summer",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/fba47053-378a-4e8c-b756-e2890e93abc4.jpg",
    alt: "Woman in a light beige cotton summer dress in a bright shop doorway",
    title: "ချည်သား Summer ဂါဝန် - Beige",
    subtitle: "Beige Summer Dress",
    price: 42000,
    category: "dresses",
    sizes: ["S", "M", "L"],
    compareAtPrice: 52000,
    onSale: true,
  },
  {
    id: "sage-linen-set",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/17ae7a2e-3ca2-49c0-99ea-4a6b892c3bbe.jpg",
    alt: "Woman wearing a sage green linen top and longyi style skirt",
    title: "Linen ဂါဝန် - Sage",
    subtitle: "Sage Linen Set",
    price: 47500,
    category: "dresses",
    sizes: ["S", "M"],
    onSale: true,
  },
  {
    id: "cotton-blouse",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/a4cb1f42-de42-4257-b457-83c2f6553016.jpg",
    alt: "Folded white cotton blouse on a hanger",
    title: "ချည်ဖြူ Blouse",
    subtitle: "Cotton Blouse",
    price: 30000,
    category: "tops",
    sizes: ["S", "M", "L"],
  },
  {
    id: "rattan-handbag",
    image:
      "https://storage.googleapis.com/banani-generated-images/generated-images/c1475f1b-9895-40a4-a355-d47a2b849406.jpg",
    alt: "Woven rattan handbag with a cotton dress in the background",
    title: "ခြင်းကြား Handbag",
    subtitle: "Rattan Handbag",
    price: 39000,
    category: "bags",
    sizes: [],
    badge: "Hot",
  },
]

/** Curated home-page selection, in the order they should appear. */
const FEATURED_IDS = [
  "peach-midi",
  "linen-day-dress",
  "knit-cardigan",
  "rattan-handbag",
]

export function getFeaturedProducts(): CatalogProduct[] {
  return FEATURED_IDS.map((id) =>
    PRODUCTS.find((product) => product.id === id)
  ).filter((product): product is CatalogProduct => Boolean(product))
}

export function getProductsByIds(ids: string[]): CatalogProduct[] {
  const wanted = new Set(ids)

  return PRODUCTS.filter((product) => wanted.has(product.id))
}

export function filterProducts(
  products: CatalogProduct[],
  filters: CatalogFilters
): CatalogProduct[] {
  return products.filter((product) => {
    const matchesCategory =
      filters.category === null ||
      (filters.category === "sale"
        ? product.onSale === true
        : product.category === filters.category)

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

  return products.filter((product) =>
    [product.title, product.subtitle, product.id].some((value) =>
      value.toLowerCase().includes(needle)
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

export function formatPrice(price: number) {
  return `${price.toLocaleString("en-US")} Ks`
}

const MYANMAR_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"]

export function toMyanmarDigits(value: number) {
  return String(value).replace(
    /\d/g,
    (digit) => MYANMAR_DIGITS[Number(digit)] ?? digit
  )
}
