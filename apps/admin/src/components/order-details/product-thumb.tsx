import { Shirt } from "lucide-react"

/**
 * Stand-in for the product photo in the design.
 *
 * The repo has no product images yet — the storefront will pull them from the
 * API — and hot-linking the mock's generated URLs would make the admin depend
 * on a third party, so the thumbnail is a tile with the garment glyph. It is
 * decorative: the product name sits right beside it.
 */
export function ProductThumb() {
  return (
    <span
      aria-hidden
      className="flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary"
    >
      <Shirt className="size-6 text-primary/70" strokeWidth={2} />
    </span>
  )
}
