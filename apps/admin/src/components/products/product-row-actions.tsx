import { Button } from "@workspace/ui/components/button"
import { Copy, Pencil, Trash2 } from "lucide-react"

import type { ProductSummary } from "@/lib/products"

type ProductRowActionsProps = {
  product: ProductSummary
  onDuplicate: (product: ProductSummary) => void
  onHide: (product: ProductSummary) => void
}

/**
 * Edit / duplicate / hide.
 *
 * Edit is the one action with no screen behind it yet, so it renders disabled
 * with a title rather than linking to the catch-all redirect. Duplicate and
 * hide act on the row in place — both offer Undo in the banner above the list.
 */
export function ProductRowActions({
  product,
  onDuplicate,
  onHide,
}: ProductRowActionsProps) {
  return (
    <div className="flex justify-end gap-1.5">
      <Button
        variant="outline"
        disabled
        title="Product editor coming soon"
        className="min-h-11 gap-1 rounded-md px-3 text-[13px] font-semibold text-primary"
      >
        <Pencil className="size-3.5" strokeWidth={3.4} />
        Edit
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Duplicate ${product.nameEn}`}
        title="Duplicate as a hidden draft"
        onClick={() => onDuplicate(product)}
        className="size-11 rounded-md text-foreground"
      >
        <Copy className="size-[15px]" strokeWidth={3.2} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Hide ${product.nameEn}`}
        title="Hide product"
        onClick={() => onHide(product)}
        className="size-11 rounded-md text-muted-foreground"
      >
        <Trash2 className="size-[15px]" strokeWidth={3.2} />
      </Button>
    </div>
  )
}
