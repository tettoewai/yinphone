import { Check } from "lucide-react"
import { useState } from "react"

import { CategoryRow } from "@/components/categories/category-row"
import type { AdminCategory } from "@/lib/categories"
import { formatClockTime } from "@/lib/yangon-time"

type CategorySortCardProps = {
  categories: readonly AdminCategory[]
  /** Yangon time of the last change in this tab; `null` before the first one. */
  lastSavedAt: Date | null
  onReorder: (from: number, to: number) => void
  onToggle: (category: AdminCategory, visible: boolean) => void
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
}

/**
 * The sort-order card: the header with its save state, one row per category and
 * the delete rule spelled out underneath.
 *
 * Drag state lives here rather than in the page — a row only needs to know
 * whether it is the one being dragged, and the drop target is always another
 * row in the same list.
 */
export function CategorySortCard({
  categories,
  lastSavedAt,
  onReorder,
  onToggle,
  onEdit,
  onDelete,
}: CategorySortCardProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  function dropAt(index: number) {
    if (dragIndex !== null && dragIndex !== index) onReorder(dragIndex, index)
    setDragIndex(null)
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-5 py-3">
        <h2 className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
          Sort order • storefront menu follows this order
        </h2>

        <div className="flex items-center gap-1 text-xs font-bold">
          {lastSavedAt ? (
            <>
              <Check className="size-[13px] text-primary" strokeWidth={3.7} />
              <span className="text-primary">
                Saved in this tab • {formatClockTime(lastSavedAt)}
              </span>
            </>
          ) : (
            // Nothing is written to a server yet, so the chip cannot claim a
            // save before the first edit either.
            <span className="text-muted-foreground">Not saved yet</span>
          )}
        </div>
      </div>

      <div role="list" aria-label="Category sort order">
        {categories.map((category, index) => (
          <CategoryRow
            key={category.id}
            category={category}
            position={index + 1}
            isDragging={dragIndex === index}
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDropAt={() => dropAt(index)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <p className="bg-background px-5 py-3 font-body text-xs leading-[1.7] text-muted-foreground">
        Delete is only enabled when a category has 0 products — e.g.
        “အသုံးအဆောင်” can be deleted, others must move products first.
      </p>
    </section>
  )
}
