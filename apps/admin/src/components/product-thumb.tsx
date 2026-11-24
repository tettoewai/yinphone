import { cn } from "@workspace/ui/lib/utils"
import { Shirt } from "lucide-react"

type ProductThumbProps = {
  /** Sizing overrides; the order screen uses the design's 56px tile. */
  className?: string
}

/**
 * Stand-in for a product photo.
 *
 * The repo has no product images yet — the storefront will pull them from the
 * API — and hot-linking the mock's generated URLs would make the admin depend
 * on a third party, so the thumbnail is a tile with the garment glyph. It is
 * decorative: the product name always sits beside it.
 */
export function ProductThumb({ className }: ProductThumbProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary",
        className
      )}
    >
      <Shirt className="size-6 text-primary/70" strokeWidth={2} />
    </span>
  )
}
