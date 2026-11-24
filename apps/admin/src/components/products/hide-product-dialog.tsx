import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { EyeOff, Trash2 } from "lucide-react"

import type { ProductSummary } from "@/lib/products"

type HideProductDialogProps = {
  /** The product to confirm; the page renders nothing while this is `null`. */
  product: ProductSummary | null
  onOpenChange: (open: boolean) => void
  onConfirm: (product: ProductSummary) => void
}

/**
 * The destructive confirmation from the design.
 *
 * Hiding is not deleting: the product leaves the shop and the staff list but
 * stays on past orders, so the copy says so and the confirm button is labelled
 * "Hide product" rather than "Delete".
 *
 * The dialog is mounted only while there is a product to confirm, so there is
 * no stale name to reset between openings — the cost is that it does not play
 * an exit animation.
 */
export function HideProductDialog({
  product,
  onOpenChange,
  onConfirm,
}: HideProductDialogProps) {
  if (!product) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-accent-foreground">
            <Trash2 className="size-[19px]" strokeWidth={2.5} />
          </span>
          <DialogHeader>
            <DialogTitle>“{product.nameMy}” ကို ဖျက်မလား?</DialogTitle>
            <DialogDescription>
              ဆိုင်မှ ဝှက်ထားမည် — အပြီးမဖျက်ပါ။ ဟောင်း မှာယူမှုများတွင်
              ဆက်မြင်နေရမည်။
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-11 px-6 text-sm font-bold"
          >
            Keep it
          </Button>
          <Button
            onClick={() => onConfirm(product)}
            className="min-h-11 gap-1.5 bg-accent px-6 text-sm font-bold text-accent-foreground hover:bg-accent/85"
          >
            <EyeOff className="size-[15px]" strokeWidth={3.2} />
            Hide product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
