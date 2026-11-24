import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { ProductThumb } from "@/components/order-details/product-thumb"
import { formatMmk } from "@/lib/format"
import {
  orderItemCount,
  orderSubtotal,
  type OrderDetail,
} from "@/lib/order-details"

const headCell =
  "py-2.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase"

/**
 * The items card: what was ordered, at what price, and the totals block the
 * design closes it with. The table scrolls sideways on narrow screens rather
 * than restacking, because the five columns are what makes the arithmetic
 * readable.
 */
export function OrderItemsCard({ order }: { order: OrderDetail }) {
  const subtotal = orderSubtotal(order)

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
          မှာယူထားသော ပစ္စည်းများ{" "}
          <span className="font-normal text-muted-foreground">
            • Items ({orderItemCount(order)})
          </span>
        </h2>
        <span className="text-xs text-muted-foreground">
          Prices in MMK • right-aligned
        </span>
      </div>

      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow className="border-border bg-background hover:bg-transparent">
            <TableHead className={cn(headCell, "w-[42%] pl-5")}>
              Product
            </TableHead>
            <TableHead className={cn(headCell, "w-[20%] px-3")}>
              Variant
            </TableHead>
            <TableHead className={cn(headCell, "w-[8%] px-2 text-center")}>
              Qty
            </TableHead>
            <TableHead className={cn(headCell, "w-[15%] px-3 text-right")}>
              Unit price
            </TableHead>
            <TableHead className={cn(headCell, "w-[15%] pr-5 text-right")}>
              Line total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow
              key={item.id}
              className="border-border hover:bg-transparent"
            >
              <TableCell className="py-3 pl-5">
                <div className="flex items-center gap-3">
                  <ProductThumb />
                  <div className="min-w-0">
                    <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.latinName} • SKU {item.sku}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 text-[13px] text-foreground">
                {item.variant}
              </TableCell>
              <TableCell className="px-2 text-center text-sm text-foreground tabular-nums">
                ×{item.quantity}
              </TableCell>
              <TableCell className="px-3 text-right text-sm text-muted-foreground tabular-nums">
                {formatMmk(item.unitPriceMmk)}
              </TableCell>
              <TableCell className="pr-5 text-right text-sm font-bold text-foreground tabular-nums">
                {formatMmk(item.quantity * item.unitPriceMmk)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-1.5 border-t border-border bg-background px-5 py-4">
        <div className="flex justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-body">Subtotal • အစုစုပေါင်း</span>
          <span className="font-bold text-foreground tabular-nums">
            {formatMmk(subtotal)}
          </span>
        </div>
        <div className="flex justify-between gap-3 text-sm text-muted-foreground">
          <span>Delivery ({order.delivery.courier})</span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatMmk(order.delivery.feeMmk)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-1.5">
          <span className="font-body text-sm leading-[1.7] font-bold text-foreground">
            Total • စုစုပေါင်း
          </span>
          <span className="text-right font-heading text-xl font-bold text-foreground tabular-nums">
            {formatMmk(order.totalMmk)}
          </span>
        </div>
      </div>
    </section>
  )
}
