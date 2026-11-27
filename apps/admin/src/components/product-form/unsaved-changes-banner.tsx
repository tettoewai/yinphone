import { TriangleAlert } from "lucide-react"

type UnsavedChangesBannerProps = {
  onDiscard: () => void
}

/**
 * The amber strip from the design. "Discard" drops the local edits: the add form
 * goes back to a blank editor and the edit form goes back to the values the API
 * returned.
 */
export function UnsavedChangesBanner({ onDiscard }: UnsavedChangesBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-secondary px-4 py-3">
      <TriangleAlert
        className="size-[17px] shrink-0 text-primary"
        strokeWidth={2.8}
      />

      <div className="min-w-0 flex-1 font-body text-sm leading-[1.7] text-foreground">
        မသိမ်းရသေးသော ပြောင်းလဲမှုများ ရှိပါတယ်။{" "}
        <span className="text-muted-foreground">
          Unsaved changes — leaving will discard them.
        </span>
      </div>

      <button
        type="button"
        onClick={onDiscard}
        className="shrink-0 rounded-sm text-xs font-bold text-primary underline underline-offset-4 outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Discard
      </button>
    </div>
  )
}
