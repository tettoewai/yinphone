/**
 * Types, mock rows and the pure helpers behind `/categories`.
 *
 * `AdminCategory` is what `GET /api/categories` should return: the category row
 * plus the two things this screen needs — how many products are filed under it
 * (which decides whether it may be deleted) and whether it appears in the
 * storefront menu.
 *
 * The mock carries the design's six categories and their counts, 24 products in
 * all, so the delete rule is exercised by real-looking data: only
 * “အသုံးအဆောင်” is empty. Nothing here imports React.
 */

export type AdminCategory = {
  id: string
  /** Storefront URL segment: `yinphone.shop/c/<slug>`. Stable across renames. */
  slug: string
  nameMy: string
  nameEn: string
  /** Products filed under this category; deletion is blocked while above zero. */
  productCount: number
  /** Switched on in the storefront menu. Hidden categories keep their products. */
  isVisible: boolean
}

/**
 * The design's list, in storefront order. Counts sum to the 24 products on
 * `/products`; `knitwear` starts switched off, which is why the live preview
 * beside the sort card has one row fewer than the list.
 */
export const CATEGORIES_MOCK: readonly AdminCategory[] = [
  {
    id: "cat_dresses",
    slug: "dresses",
    nameMy: "ဂါဝန်",
    nameEn: "Dresses",
    productCount: 9,
    isVisible: true,
  },
  {
    id: "cat_tops",
    slug: "tops",
    nameMy: "အပေါ်ထပ်",
    nameEn: "Tops & Blouses",
    productCount: 7,
    isVisible: true,
  },
  {
    id: "cat_skirts",
    slug: "skirts",
    nameMy: "စကတ်",
    nameEn: "Skirts",
    productCount: 4,
    isVisible: true,
  },
  {
    id: "cat_pants",
    slug: "pants",
    nameMy: "ဘောင်းဘီ",
    nameEn: "Pants",
    productCount: 3,
    isVisible: true,
  },
  {
    id: "cat_knitwear",
    slug: "knitwear",
    nameMy: "အနွေးထည်",
    nameEn: "Knitwear",
    productCount: 1,
    isVisible: false,
  },
  {
    id: "cat_accessories",
    slug: "accessories",
    nameMy: "အသုံးအဆောင်",
    nameEn: "Accessories",
    productCount: 0,
    isVisible: true,
  },
]

/** The editable half of a category — what the add/edit dialog produces. */
export type CategoryDraft = {
  nameMy: string
  nameEn: string
}

export type CategoryDraftField = "nameMy" | "nameEn"

const REQUIRED_FIELDS: readonly CategoryDraftField[] = ["nameMy", "nameEn"]

const REQUIRED_ERRORS: Record<CategoryDraftField, string> = {
  nameMy: "မြန်မာအမည် ဖြည့်ပါ • Myanmar name is required",
  nameEn: "အင်္ဂလိပ်အမည် ဖြည့်ပါ • English name is required",
}

/** The dialog's starting values for an existing row. */
export function categoryDraft(category: AdminCategory): CategoryDraft {
  return { nameMy: category.nameMy, nameEn: category.nameEn }
}

/** The message under a field, or `undefined` while it is valid. */
export function fieldError(draft: CategoryDraft, field: CategoryDraftField) {
  return draft[field].trim() === "" ? REQUIRED_ERRORS[field] : undefined
}

/** Required fields still empty, in the order the dialog renders them. */
export function missingFields(draft: CategoryDraft): CategoryDraftField[] {
  return REQUIRED_FIELDS.filter(
    (field) => fieldError(draft, field) !== undefined
  )
}

/**
 * "Tops & Blouses" → "tops-blouses". Names without Latin letters produce an
 * empty slug; `uniqueSlug`'s caller falls back to "category" in that case rather
 * than blocking a shop that only types Burmese.
 */
export function slugifyCategory(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** `dresses`, `dresses-2`, `dresses-3`… the first slug not already in use. */
export function uniqueSlug(base: string, taken: readonly string[]) {
  if (!taken.includes(base)) return base

  let suffix = 2
  while (taken.includes(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

/** The storefront link shown in the dialog, minus the scheme. */
export function storefrontUrl(slug: string) {
  return `yinphone.shop/c/${slug || "…"}`
}

/** "Dresses • /dresses • 9 products" — the second line of a row. */
export function categoryMeta(category: AdminCategory) {
  const products =
    category.productCount === 1
      ? "1 product"
      : `${category.productCount} products`
  return `${category.nameEn} • /${category.slug} • ${products}`
}

/** The count chip: "9 items", or "0 • empty" when nothing is filed under it. */
export function categoryCountLabel(category: AdminCategory) {
  if (category.productCount === 0) return "0 • empty"
  return `${category.productCount} ${category.productCount === 1 ? "item" : "items"}`
}

/**
 * Only an empty category can go. Everything else must have its products moved
 * to another category first, because deleting would orphan them.
 */
export function canDeleteCategory(category: AdminCategory) {
  return category.productCount === 0
}

/** The live storefront menu: switched-on categories, in sort order. */
export function visibleCategories(categories: readonly AdminCategory[]) {
  return categories.filter((category) => category.isVisible)
}

/** A new row from the dialog. Count is zero, so it can be deleted again at once. */
export function createCategory(
  draft: CategoryDraft,
  slug: string
): AdminCategory {
  return {
    id: `cat_${slug}`,
    slug,
    nameMy: draft.nameMy,
    nameEn: draft.nameEn,
    productCount: 0,
    isVisible: true,
  }
}

/**
 * Applies a rename. The slug is deliberately untouched: it is the category's
 * storefront URL, and links to it must survive a copy edit.
 */
export function applyCategoryDraft(
  category: AdminCategory,
  draft: CategoryDraft
): AdminCategory {
  return { ...category, nameMy: draft.nameMy, nameEn: draft.nameEn }
}

/** Moves one row to another position; a no-op drop returns the list as-is. */
export function reorderCategories(
  categories: AdminCategory[],
  from: number,
  to: number
): AdminCategory[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= categories.length ||
    to >= categories.length
  ) {
    return categories
  }

  const next = [...categories]
  const [moved] = next.splice(from, 1)
  if (!moved) return categories

  next.splice(to, 0, moved)
  return next
}
