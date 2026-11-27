import { cn } from "@workspace/ui/lib/utils"
import { Shirt } from "lucide-react"

type ProductThumbProps = {
  /** Sizing overrides; the order screen uses the design's 56px tile. */
  className?: string
  /**
   * The product's MAIN photo. `null`/absent renders the garment glyph, which is
   * what a product with no photos shows.
   */
  src?: string | null
}

/**
 * A product photo tile, with the garment glyph standing in when there is no
 * photo.
 *
 * The product name always sits beside the tile, so the image is decorative and
 * carries an empty `alt`.
 */
export function ProductThumb({ className, src }: ProductThumbProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <Shirt className="size-6 text-primary/70" strokeWidth={2} />
      )}
    </span>
  )
}
