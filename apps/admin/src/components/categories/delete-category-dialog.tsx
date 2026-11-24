import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Trash2 } from "lucide-react"

import type { AdminCategory } from "@/lib/categories"

type DeleteCategoryDialogProps = {
  /** The category to confirm; the page renders nothing while this is `null`. */
  category: AdminCategory | null
  onOpenChange: (open: boolean) => void
  onConfirm: (category: AdminCategory) => void
}

/**
 * The confirmation behind the row's trash button.
 *
 * Only empty categories reach this point — the row disables the button
 * otherwise — so the copy can promise that no product is affected. Like the
 * products screen's hide dialog it is mounted only while there is something to
 * confirm, so there is no stale name to reset between openings.
 */
export function DeleteCategoryDialog({
  category,
  onOpenChange,
  onConfirm,
}: DeleteCategoryDialogProps) {
  if (!category) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-accent-foreground">
            <Trash2 className="size-[19px]" strokeWidth={2.5} />
          </span>
          <DialogHeader>
            <DialogTitle>“{category.nameMy}” ကို ဖျက်မလား?</DialogTitle>
            <DialogDescription>
              ဤအမျိုးအစားတွင် ထုတ်ကုန် မရှိပါ — ဖျက်လိုက်လျှင် ပြန်ယူ၍ မရပါ။
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-11 px-6 text-sm font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(category)}
            className="min-h-11 gap-1.5 bg-accent px-6 text-sm font-bold text-accent-foreground hover:bg-accent/85"
          >
            <Trash2 className="size-[15px]" strokeWidth={3.2} />
            Delete category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
