/**
 * Types and the pure helpers behind `/categories`.
 *
 * The rows come from `GET /api/admin/categories`: the category plus the two
 * things this screen needs — how many products are filed under it (which
 * decides whether it may be deleted) and its sort order. Every other helper
 * here is plain data manipulation; nothing imports React.
 */

import type { AdminCategory } from "@/lib/api"

export type { AdminCategory }

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
 * empty slug; the dialog falls back to "category" in that case rather than
 * blocking a shop that only types Burmese.
 */
export function slugifyCategory(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
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

/** Moves one row to another position; a no-op drop returns the list as-is. */
export function moveCategory(
  categories: readonly AdminCategory[],
  from: number,
  to: number
): readonly AdminCategory[] {
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
