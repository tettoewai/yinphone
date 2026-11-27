/**
 * Types and the pure helpers behind the product editor (`/products/new` and
 * `/products/:id/edit`).
 *
 * Nothing here imports React. The draft is kept as strings (not parsed numbers)
 * because the price field has to preserve exactly what the user typed while it
 * groups digits, and because the same shape is what the create and update
 * bodies are built from.
 */

import type {
  AdminProductDetail,
  AdminProductSize,
  CreateProductBody,
} from "@/lib/api"

/** The description counter in the design ("86 / 500"). */
export const DESCRIPTION_LIMIT = 500

/** The design's Photos (4/6) cap, and the editor's own limit on images. */
export const MAX_PHOTOS = 6

/**
 * A photo in the editor. `url` is either an http(s) address that is saved with
 * the product or a `blob:` object URL for a file picked in this tab; `null`
 * renders the garment glyph.
 */
export type ProductPhoto = {
  id: string
  url: string | null
  /** Saved alongside the image; `null` when the shop did not describe it. */
  altText?: string | null
}

export type ProductDraft = {
  nameMy: string
  nameEn: string
  /** Category **id**, or `""` before one is chosen. */
  category: string
  /** Digits only; `formatPriceDigits` adds the grouping. */
  price: string
  stock: number
  /** Empty means one size fits all, e.g. longyi. */
  sizes: AdminProductSize[]
  descriptionMy: string
  descriptionEn: string
  isActive: boolean
  photos: readonly ProductPhoto[]
}

/** The fields the save button refuses to submit while empty. */
export type DraftField = "nameMy" | "nameEn" | "category" | "price"

const REQUIRED_FIELDS: readonly DraftField[] = [
  "nameMy",
  "nameEn",
  "category",
  "price",
]

const REQUIRED_ERRORS: Record<DraftField, string> = {
  nameMy: "မြန်မာအမည် ဖြည့်ပါ • Myanmar name is required",
  nameEn: "အင်္ဂလိပ်အမည် ဖြည့်ပါ • English name is required",
  category: "အမျိုးအစား ရွေးပါ • Category is required",
  price: "ဈေးနှုန်း ဖြည့်ပါ • Price is required",
}

/** The message under a field, or `undefined` while it is valid. */
export function fieldError(draft: ProductDraft, field: DraftField) {
  switch (field) {
    case "nameMy":
      return draft.nameMy.trim() ? undefined : REQUIRED_ERRORS.nameMy
    case "nameEn":
      return draft.nameEn.trim() ? undefined : REQUIRED_ERRORS.nameEn
    case "category":
      return draft.category ? undefined : REQUIRED_ERRORS.category
    case "price":
      if (draft.price === "") return REQUIRED_ERRORS.price
      return Number(draft.price) > 0
        ? undefined
        : "ဈေးနှုန်းသည် 0 ထက် ကြီးရမည် • Price must be more than 0"
  }
}

/** Required fields still empty, in the order the form renders them. */
export function missingFields(draft: ProductDraft): DraftField[] {
  return REQUIRED_FIELDS.filter(
    (field) => fieldError(draft, field) !== undefined
  )
}

/**
 * Whether the user has typed anything yet. The unsaved-changes strip and the
 * Discard action are both keyed off this rather than off a comparison with the
 * seed, so discarding really does leave a blank editor.
 */
export function isDraftBlank(draft: ProductDraft) {
  return (
    draft.nameMy.trim() === "" &&
    draft.nameEn.trim() === "" &&
    draft.category === "" &&
    draft.price === "" &&
    draft.stock === 0 &&
    draft.sizes.length === 0 &&
    draft.descriptionMy === "" &&
    draft.descriptionEn === "" &&
    draft.photos.length === 0
  )
}

/**
 * A photo the API can store. Picked files exist only as `blob:` object URLs
 * until there is an upload endpoint, so they never reach the payload.
 */
export function isSavedPhoto(
  photo: ProductPhoto
): photo is ProductPhoto & { url: string } {
  return photo.url !== null && !photo.url.startsWith("blob:")
}

/** How many picked files will be left out of the save. */
export function localOnlyPhotoCount(photos: readonly ProductPhoto[]) {
  return photos.filter((photo) => !isSavedPhoto(photo)).length
}

/** A full http(s) address, the only thing the image schema accepts. */
export function isHttpUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim())
}

const grouped = new Intl.NumberFormat("en-US")

/** `"45000"` → `"45,000"`; anything that is not a digit is dropped. */
export function formatPriceDigits(digits: string) {
  if (digits === "") return ""
  return grouped.format(Number(digits))
}

/** `"45,000 Ks"` → `"45000"`, with leading zeros removed as they are typed. */
export function priceDigitsFrom(input: string) {
  return input.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
}

/** A blank draft, used by the add form and by the banner's "Discard" action. */
export function createBlankDraft(): ProductDraft {
  return {
    nameMy: "",
    nameEn: "",
    category: "",
    price: "",
    stock: 0,
    sizes: [],
    descriptionMy: "",
    descriptionEn: "",
    isActive: true,
    photos: [],
  }
}

/** The editor's draft for an existing product (`GET /api/admin/products/:id`). */
export function draftFromProduct(product: AdminProductDetail): ProductDraft {
  return {
    nameMy: product.nameMy,
    nameEn: product.nameEn,
    category: product.category.id,
    price: String(product.priceMmk),
    stock: product.stock,
    sizes: [...product.sizes],
    descriptionMy: product.descriptionMy ?? "",
    descriptionEn: product.descriptionEn ?? "",
    isActive: product.isActive,
    photos: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: `image-${image.id}`,
        url: image.url,
        altText: image.altText,
      })),
  }
}

/**
 * The create body, also used for `PATCH` — sending every field is the same as
 * sending only the changed ones, and it keeps the mapping in one place. Images
 * are a full replacement: the draft's grid is exactly what the product keeps.
 */
export function draftToBody(draft: ProductDraft): CreateProductBody {
  return {
    nameMy: draft.nameMy.trim(),
    nameEn: draft.nameEn.trim(),
    descriptionMy: draft.descriptionMy.trim(),
    descriptionEn: draft.descriptionEn.trim(),
    priceMmk: Number(draft.price),
    stock: draft.stock,
    sizes: [...draft.sizes],
    categoryId: draft.category,
    isActive: draft.isActive,
    images: draft.photos.filter(isSavedPhoto).map((photo, sortOrder) => ({
      url: photo.url,
      altText: photo.altText ?? undefined,
      sortOrder,
    })),
  }
}
