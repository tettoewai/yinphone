import { Tags } from "lucide-react"

/**
 * What the screen shows once every category has been deleted.
 *
 * The header's "Add category" button is the way out, so this card stays a
 * statement of what categories are for rather than repeating the action.
 */
export function CategoryEmptyState() {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-card px-6 py-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
        <Tags className="size-[22px] text-primary" strokeWidth={2.2} />
      </span>

      <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
        အမျိုးအစား မရှိသေးပါ
      </p>
      <p className="font-body text-xs leading-[1.7] text-muted-foreground">
        No categories yet. Categories help customers find products faster.
      </p>
    </div>
  )
}
