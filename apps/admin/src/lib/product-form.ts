/**
 * Types and the pure helpers behind the add-product form (`/products/new`).
 *
 * Nothing here imports React. The draft is kept as strings (not parsed numbers)
 * because the price field has to preserve exactly what the user typed while it
 * groups digits, and because the same shape is what a `POST /api/products`
 * body would be built from once the endpoint exists.
 *
 * The seeded draft mirrors the design's demo state: a restored draft that is
 * still missing its English name. That is why `nameEn` starts empty and shows
 * its error immediately instead of waiting for a blur.
 */

/** The description counter in the design ("86 / 500"). */
export const DESCRIPTION_LIMIT = 500

/** The design's Photos (4/6) cap. */
export const MAX_PHOTOS = 6

/**
 * A photo in the editor. `url` is an object URL from a picked file; `null`
 * means one of the seeded sample tiles, which render the garment glyph because
 * the repo has no product images to ship.
 */
export type ProductPhoto = {
  id: string
  url: string | null
}

export type ProductDraft = {
  nameMy: string
  nameEn: string
  /** Category slug, or `""` before one is chosen. */
  category: string
  /** Digits only; `formatPriceDigits` adds the grouping. */
  price: string
  stock: number
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
    draft.descriptionMy === "" &&
    draft.descriptionEn === "" &&
    draft.photos.length === 0
  )
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

/**
 * A fresh copy of the design's draft. Returns a new object (and new photo
 * array) each call so "Discard" can reset without sharing state.
 */
export function createSeedDraft(): ProductDraft {
  return {
    nameMy: "ချည်သား Midi ဂါဝန်",
    nameEn: "",
    category: "dresses",
    price: "45000",
    stock: 12,
    descriptionMy:
      "ပေါ့ပါးသော ချည်သားလေးနဲ့ ချုပ်ထားပါတယ်။ နွေရာသီအတွက် အသင့်တော်ဆုံးပါ။",
    descriptionEn:
      "Light breathable cotton midi dress with pockets. True to size — take your usual size.",
    isActive: true,
    photos: [
      { id: "sample-1", url: null },
      { id: "sample-2", url: null },
      { id: "sample-3", url: null },
    ],
  }
}

/** A blank draft, used by the banner's "Discard" action. */
export function createBlankDraft(): ProductDraft {
  return {
    nameMy: "",
    nameEn: "",
    category: "",
    price: "",
    stock: 0,
    descriptionMy: "",
    descriptionEn: "",
    isActive: true,
    photos: [],
  }
}
