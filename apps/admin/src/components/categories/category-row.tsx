import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"
import { GripVertical, Pencil, Trash2 } from "lucide-react"

import {
  canDeleteCategory,
  categoryCountLabel,
  categoryMeta,
  type AdminCategory,
} from "@/lib/categories"

type CategoryRowProps = {
  category: AdminCategory
  /** 1-based position, shown in the drag handle. */
  position: number
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDropAt: () => void
  onToggle: (category: AdminCategory, visible: boolean) => void
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
}

/**
 * One row of the sort-order list: handle, names, product count, the storefront
 * toggle and the row's two actions.
 *
 * Only the handle is a drag source, so dragging never competes with the switch
 * or with selecting the name. Delete stays in the markup while it is blocked —
 * disabled and faded with the reason in its tooltip — because a control that
 * vanishes as the product count changes is harder to reason about.
 */
export function CategoryRow({
  category,
  position,
  isDragging,
  onDragStart,
  onDragEnd,
  onDropAt,
  onToggle,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  const deletable = canDeleteCategory(category)

  return (
    <div
      role="listitem"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onDropAt()
      }}
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-border px-4 py-3",
        isDragging && "bg-accent/10"
      )}
    >
      <span
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-hidden
        title="Drag to reorder"
        className="flex h-11 w-11 shrink-0 cursor-grab flex-col items-center justify-center rounded-md border border-border bg-background text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" strokeWidth={3} />
        <span className="text-[10px] font-bold">{position}</span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-sm leading-[1.7] font-bold text-foreground">
          {category.nameMy}
        </div>
        <div className="-mt-0.5 truncate text-xs text-muted-foreground">
          {categoryMeta(category)}
        </div>
      </div>

      <span
        className={cn(
          "hidden shrink-0 rounded-sm px-2 py-1 text-xs font-bold sm:block",
          category.productCount === 0
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {categoryCountLabel(category)}
      </span>

      <Switch
        checked={category.isVisible}
        onCheckedChange={(visible) => onToggle(category, visible)}
        aria-label={`${category.nameEn} in the storefront menu`}
        className="h-[30px] w-[52px] shrink-0 rounded-xl border-0 p-1 [--switch-thumb-size:22px] [--switch-thumb-travel:22px]"
      />

      {/* Below `sm` the two actions take the next line, so the names keep the
          width they need instead of being squeezed to a few characters. */}
      <div className="flex shrink-0 gap-1.5 max-sm:w-full max-sm:justify-end">
        <Button
          variant="outline"
          onClick={() => onEdit(category)}
          className="min-h-11 gap-1 rounded-md px-3 text-[13px] font-semibold text-primary"
        >
          <Pencil className="size-3.5" strokeWidth={3.4} />
          Edit
        </Button>

        {/* The tooltip lives on the wrapper: a disabled button receives no
            pointer events, so its own `title` would never show. */}
        <span
          className="flex"
          title={
            deletable ? "Delete category" : "Has products — move products first"
          }
        >
          <Button
            variant="outline"
            size="icon"
            disabled={!deletable}
            aria-label={
              deletable
                ? `Delete ${category.nameEn}`
                : `${category.nameEn} cannot be deleted while it has products`
            }
            onClick={() => onDelete(category)}
            className={cn(
              "size-11 rounded-md",
              deletable
                ? "text-foreground"
                : "border-transparent bg-muted text-muted-foreground disabled:opacity-60"
            )}
          >
            <Trash2 className="size-[15px]" strokeWidth={3.2} />
          </Button>
        </span>
      </div>
    </div>
  )
}
