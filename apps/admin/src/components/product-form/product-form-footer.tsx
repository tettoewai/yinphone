import { Button } from "@workspace/ui/components/button"
import { Check, LoaderCircle } from "lucide-react"

import { MAX_PHOTOS } from "@/lib/product-form"

type ProductFormFooterProps = {
  /** `create` is the add screen; `edit` is an existing product. */
  mode: "create" | "edit"
  photoCount: number
  /** Picked files that will be left out of the save (no upload endpoint yet). */
  localOnlyCount?: number
  saving?: boolean
  onCancel: () => void
  onSave: () => void
}

/** The form's action bar: the draft summary, Cancel and Save. */
export function ProductFormFooter({
  mode,
  photoCount,
  localOnlyCount = 0,
  saving = false,
  onCancel,
  onSave,
}: ProductFormFooterProps) {
  return (
    <div className="px-4 pb-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-5 py-3">
        <p className="font-body text-xs text-muted-foreground tabular-nums">
          {saving ? "Saving…" : mode === "edit" ? "Editing" : "Not saved yet"} •
          Photos {photoCount}/{MAX_PHOTOS}
          {localOnlyCount > 0 ? ` • ${localOnlyCount} not uploaded` : ""}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="min-h-12 px-6 text-sm font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="min-h-12 gap-2 px-6 text-sm font-bold"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" strokeWidth={3} />
            )}
            {saving ? "Saving…" : "Save product • သိမ်းရန်"}
          </Button>
        </div>
      </div>
    </div>
  )
}
