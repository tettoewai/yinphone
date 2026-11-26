import { ProductThumb } from "@/components/product-thumb"
import { ProductRowActions } from "@/components/products/product-row-actions"
import { ProductVisibilitySwitch } from "@/components/products/product-visibility-switch"
import { StockBadge } from "@/components/products/stock-badge"
import { formatMmk } from "@/lib/format"
import type { ProductSummary } from "@/lib/products"

type ProductsMobileListProps = {
  products: readonly ProductSummary[]
  onToggle: (product: ProductSummary, active: boolean) => void
  onDuplicate: (product: ProductSummary) => void
  onHide: (product: ProductSummary) => void
}

/**
 * The phone view: thumbnail, name and toggle on top, then category, price and
 * stock, then the same actions the table row carries.
 */
export function ProductsMobileList({
  products,
  onToggle,
  onDuplicate,
  onHide,
}: ProductsMobileListProps) {
  return (
    <ul className="flex flex-col gap-3 p-3">
      {products.map((product) => (
        <li
          key={product.id}
          className="rounded-lg border border-border bg-background p-3.5"
        >
          <div className="flex items-start gap-3">
            <ProductThumb className="size-12 rounded-md" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-body text-sm leading-[1.7] font-bold text-foreground">
                {product.nameMy}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {product.nameEn}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {product.category.nameMy} • {product.category.nameEn}
              </div>
            </div>
            <ProductVisibilitySwitch product={product} onChange={onToggle} />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatMmk(product.priceMmk)}
            </span>
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-2.5 border-t border-border pt-2.5">
            <ProductRowActions
              product={product}
              onDuplicate={onDuplicate}
              onHide={onHide}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
