import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { ProductThumb } from "@/components/product-thumb"
import { ProductRowActions } from "@/components/products/product-row-actions"
import { ProductVisibilitySwitch } from "@/components/products/product-visibility-switch"
import { StockBadge } from "@/components/products/stock-badge"
import { formatMmk } from "@/lib/format"
import type { ProductSummary } from "@/lib/products"

const headCell =
  "py-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase"

type ProductsTableProps = {
  products: readonly ProductSummary[]
  onToggle: (product: ProductSummary, active: boolean) => void
  onDuplicate: (product: ProductSummary) => void
  onHide: (product: ProductSummary) => void
}

/**
 * The desktop products table.
 *
 * The design lays it out as a twelve-column grid; the same proportions are
 * expressed here as column widths on a real `<table>` so screen readers get row
 * and column semantics. Below `md` the page swaps this for
 * `ProductsMobileList` rather than squeezing six columns into a phone.
 */
export function ProductsTable({
  products,
  onToggle,
  onDuplicate,
  onHide,
}: ProductsTableProps) {
  return (
    <Table className="min-w-[880px]">
      <TableHeader>
        <TableRow className="border-border bg-background hover:bg-transparent">
          <TableHead className={cn(headCell, "w-[30%] pl-5")}>
            Product
          </TableHead>
          <TableHead className={cn(headCell, "w-[17%] px-3")}>
            Category
          </TableHead>
          <TableHead className={cn(headCell, "w-[14%] px-3 text-right")}>
            Price
          </TableHead>
          <TableHead className={cn(headCell, "w-[10%] px-3 text-center")}>
            Stock
          </TableHead>
          <TableHead className={cn(headCell, "w-[9%] px-2 text-center")}>
            Active
          </TableHead>
          <TableHead className={cn(headCell, "w-[20%] pr-5 text-right")}>
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className={cn(
              "border-border hover:bg-transparent",
              // A hidden product that is only on screen because its Undo window
              // is still open reads quieter than the live rows.
              !product.isActive && "bg-muted/40"
            )}
          >
            <TableCell className="py-3 pl-5">
              <div className="flex items-center gap-3 pr-2">
                <ProductThumb className="size-12 rounded-md" />
                <div className="max-w-[280px] min-w-0">
                  <div className="truncate font-body text-sm leading-[1.7] font-bold text-foreground">
                    {product.nameMy}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {product.nameEn} • {product.sku}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-3 font-body text-[13px] text-foreground">
              {product.category.nameMy} • {product.category.nameEn}
            </TableCell>
            <TableCell className="px-3 text-right text-sm font-bold text-foreground tabular-nums">
              {formatMmk(product.priceMmk)}
            </TableCell>
            <TableCell className="px-3 text-center">
              <StockBadge stock={product.stock} />
            </TableCell>
            <TableCell className="px-2 text-center">
              <div className="flex justify-center">
                <ProductVisibilitySwitch
                  product={product}
                  onChange={onToggle}
                />
              </div>
            </TableCell>
            <TableCell className="pr-5">
              <ProductRowActions
                product={product}
                onDuplicate={onDuplicate}
                onHide={onHide}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
