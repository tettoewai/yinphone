import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { FormAlert } from "@/components/form-alert"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryEmptyState } from "@/components/categories/category-empty-state"
import { CategorySortCard } from "@/components/categories/category-sort-card"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import { StorefrontMenuCard } from "@/components/categories/storefront-menu-card"
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useCategories } from "@/hooks/use-categories"
import { ApiError, categoriesApi } from "@/lib/api"
import {
  moveCategory,
  type AdminCategory,
  type CategoryDraft,
} from "@/lib/categories"

/** Which dialog is open, if any. */
type Editor = { mode: "add" } | { mode: "edit"; category: AdminCategory }

/**
 * Categories (`/categories`).
 *
 * Rows come from `GET /api/admin/categories`. Creating, renaming, reordering
 * (drag) and deleting all write through the API and then refetch; the header
 * chip reports the real save time rather than a local edit. Only empty
 * categories may be deleted — the row disables Delete otherwise, and the API
 * refuses the request even if the button were pressed.
 */
export function CategoriesPage() {
  const {
    categories: rows,
    error,
    loading,
    refreshing,
    reload,
  } = useCategories()
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const categories = rows ?? []

  /** Runs a write, reports a failure, then refetches the list. */
  async function run(action: () => Promise<unknown>) {
    setSaving(true)
    setActionError(null)

    try {
      await action()
      setLastSavedAt(new Date())
      return true
    } catch (failure) {
      setActionError(
        failure instanceof ApiError
          ? failure.message
          : "Something went wrong. Please try again."
      )
      return false
    } finally {
      setSaving(false)
      reload()
    }
  }

  async function saveCategory(draft: CategoryDraft) {
    const saved =
      editor?.mode === "edit"
        ? await run(() => categoriesApi.update(editor.category.id, draft))
        : await run(() => categoriesApi.create(draft))

    if (saved) setEditor(null)
  }

  async function confirmDelete() {
    const target = deleteTarget
    if (!target) return

    const removed = await run(() => categoriesApi.remove(target.id))
    if (removed) setDeleteTarget(null)
  }

  /**
   * Persists the new order by writing `sortOrder = index + 1` for every row
   * whose position actually changed, then refetches.
   */
  async function reorder(from: number, to: number) {
    const next = moveCategory(categories, from, to)
    if (next === categories) return

    const changed = next
      .map((category, index) => ({ category, sortOrder: index + 1 }))
      .filter(({ category, sortOrder }) => category.sortOrder !== sortOrder)

    await run(() =>
      Promise.all(
        changed.map(({ category, sortOrder }) =>
          categoriesApi.update(category.id, { sortOrder })
        )
      )
    )
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
        {actionError ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Action failed"
            detail={actionError}
          />
        ) : null}

        {error ? (
          <RequestError
            detail={error instanceof ApiError ? error.message : undefined}
            onRetry={reload}
          />
        ) : loading ? (
          <TableSkeleton rows={4} className="rounded-lg" />
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-3 lg:col-span-2">
              {categories.length === 0 ? (
                <CategoryEmptyState />
              ) : (
                <CategorySortCard
                  categories={categories}
                  lastSavedAt={lastSavedAt}
                  saving={saving || refreshing}
                  onReorder={(from, to) => {
                    void reorder(from, to)
                  }}
                  onEdit={(category) => setEditor({ mode: "edit", category })}
                  onDelete={setDeleteTarget}
                />
              )}
            </div>

            <div className="flex flex-col gap-4">
              <StorefrontMenuCard categories={categories} />
            </div>
          </div>
        )}
      </main>

      {editor ? (
        <CategoryDialog
          mode={editor.mode}
          category={editor.mode === "edit" ? editor.category : undefined}
          onOpenChange={(open) => {
            if (!open) setEditor(null)
          }}
          onSave={(draft) => {
            void saveCategory(draft)
          }}
        />
      ) : null}

      <DeleteCategoryDialog
        category={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => {
          void confirmDelete()
        }}
      />
    </>
  )
}
