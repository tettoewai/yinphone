import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Copy, Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import type { ProductSummary } from "@/lib/products"
import { productEditPath } from "@/lib/routes"

type ProductRowActionsProps = {
  product: ProductSummary
  onDuplicate: (product: ProductSummary) => void
  onHide: (product: ProductSummary) => void
}

/**
 * Edit / duplicate / hide.
 *
 * Edit opens the same editor the add screen uses, seeded from
 * `GET /api/admin/products/:id`. Duplicate and hide act on the row in place —
 * both offer Undo in the banner above the list.
 */
export function ProductRowActions({
  product,
  onDuplicate,
  onHide,
}: ProductRowActionsProps) {
  return (
    <div className="flex justify-end gap-1.5">
      <Link
        to={productEditPath(product.id)}
        aria-label={`Edit ${product.nameEn}`}
        title="Edit product"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "min-h-11 gap-1 rounded-md px-3 text-[13px] font-semibold text-primary"
        )}
      >
        <Pencil className="size-3.5" strokeWidth={3.4} />
        Edit
      </Link>
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
