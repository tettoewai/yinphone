import { ProductThumb } from "@/components/product-thumb"
import { formatMmk } from "@/lib/format"
import type { ProductPhoto } from "@/lib/product-form"

type ShopCardPreviewProps = {
  nameMy: string
  nameEn: string
  /** Digits only, as kept in the draft. */
  price: string
  /** The first photo, which is also the MAIN one in the grid. */
  photo: ProductPhoto | undefined
}

/** The storefront card preview under the photo grid. */
export function ShopCardPreview({
  nameMy,
  nameEn,
  price,
  photo,
}: ShopCardPreviewProps) {
  return (
    <div className="rounded-md border border-border p-3.5">
      <div className="pb-2 text-xs font-bold text-foreground">
        PREVIEW • SHOP CARD
      </div>

      <div className="flex gap-3 overflow-hidden rounded-md border border-border bg-background p-2.5">
        {photo?.url ? (
          <img
            src={photo.url}
            alt=""
            className="size-16 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <ProductThumb className="size-16 rounded-sm" />
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-body text-sm font-bold text-foreground">
            {nameMy || "ထုတ်ကုန်အသစ်"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {nameEn || "New product"}
          </div>
          <div className="text-right text-sm font-bold text-foreground tabular-nums">
            {price ? formatMmk(Number(price)) : "—"}
          </div>
        </div>
      </div>
    </div>
  )
}
