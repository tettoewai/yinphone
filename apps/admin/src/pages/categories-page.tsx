import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryEmptyState } from "@/components/categories/category-empty-state"
import { CategorySortCard } from "@/components/categories/category-sort-card"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import { StorefrontMenuCard } from "@/components/categories/storefront-menu-card"
import {
  CATEGORIES_MOCK,
  applyCategoryDraft,
  createCategory,
  reorderCategories,
  slugifyCategory,
  uniqueSlug,
  type AdminCategory,
  type CategoryDraft,
} from "@/lib/categories"

/** Which dialog is open, if any. */
type Editor = { mode: "add" } | { mode: "edit"; category: AdminCategory }

/**
 * Categories (`/categories`).
 *
 * Local state only: there is no `GET/POST /api/categories` yet, so the rows come
 * from `CATEGORIES_MOCK` in `lib/categories.ts` and every change — reorder,
 * rename, toggle, delete — lives in this component. The header chip says
 * "Saved in this tab" rather than claiming a server write.
 *
 * The storefront preview beside the list reads the same array, so it cannot
 * disagree with what the rows say.
 */
export function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>(() => [
    ...CATEGORIES_MOCK,
  ])
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)

  /** Every mutation is a local edit; this is what the header chip reports. */
  function markSaved() {
    setLastSavedAt(new Date())
  }

  function toggleCategory(category: AdminCategory, visible: boolean) {
    setCategories((current) =>
      current.map((row) =>
        row.id === category.id ? { ...row, isVisible: visible } : row
      )
    )
    markSaved()
  }

  function saveCategory(draft: CategoryDraft) {
    if (editor?.mode === "edit") {
      const target = editor.category
      setCategories((current) =>
        current.map((row) =>
          row.id === target.id ? applyCategoryDraft(row, draft) : row
        )
      )
    } else {
      // A Burmese-only name slugs to "", which still needs a working link, so
      // the fallback is "category" plus the first free numeric suffix.
      const base = slugifyCategory(draft.nameEn) || "category"
      const slug = uniqueSlug(
        base,
        categories.map((category) => category.slug)
      )
      setCategories((current) => [...current, createCategory(draft, slug)])
    }

    setEditor(null)
    markSaved()
  }

  function confirmDelete() {
    if (!deleteTarget) return

    setCategories((current) =>
      current.filter((category) => category.id !== deleteTarget.id)
    )
    setDeleteTarget(null)
    markSaved()
  }

  return (
    <>
      <AdminPageHeader
        title="အမျိုးအစားများ"
        subtitle={`Categories • ${categories.length} total • drag to reorder storefront`}
        actions={
          <Button
            onClick={() => setEditor({ mode: "add" })}
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <Plus className="size-4" strokeWidth={3} />
            Add category
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {categories.length === 0 ? (
              <CategoryEmptyState />
            ) : (
              <CategorySortCard
                categories={categories}
                lastSavedAt={lastSavedAt}
                onReorder={(from, to) => {
                  setCategories((current) =>
                    reorderCategories(current, from, to)
                  )
                  markSaved()
                }}
                onToggle={toggleCategory}
                onEdit={(category) => setEditor({ mode: "edit", category })}
                onDelete={setDeleteTarget}
              />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <StorefrontMenuCard categories={categories} />
          </div>
        </div>
      </main>

      {editor ? (
        <CategoryDialog
          mode={editor.mode}
          category={editor.mode === "edit" ? editor.category : undefined}
          onOpenChange={(open) => {
            if (!open) setEditor(null)
          }}
          onSave={saveCategory}
        />
      ) : null}

      <DeleteCategoryDialog
        category={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />
    </>
  )
}
