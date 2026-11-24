import { Button } from "@workspace/ui/components/button"
import { Check } from "lucide-react"

import { MAX_PHOTOS } from "@/lib/product-form"

type ProductFormFooterProps = {
  photoCount: number
  onCancel: () => void
  onSave: () => void
}

/** The form's action bar: the draft summary, Cancel and Save. */
export function ProductFormFooter({
  photoCount,
  onCancel,
  onSave,
}: ProductFormFooterProps) {
  return (
    <div className="px-4 pb-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-5 py-3">
        <p className="font-body text-xs text-muted-foreground tabular-nums">
          Not saved yet • Photos {photoCount}/{MAX_PHOTOS}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="min-h-12 px-6 text-sm font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="min-h-12 gap-2 px-6 text-sm font-bold"
          >
            <Check className="size-4" strokeWidth={3} />
            Save product • သိမ်းရန်
          </Button>
        </div>
      </div>
    </div>
  )
}
