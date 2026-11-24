import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { Link } from "react-router-dom"

import { ChannelChip } from "@/components/orders/channel-chip"
import { OrderRowActions } from "@/components/orders/order-row-actions"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatMmk } from "@/lib/format"
import type { OrderSummary } from "@/lib/orders"
import { orderDetailPath } from "@/lib/routes"
import { formatOrderTimestamp } from "@/lib/yangon-time"

const headCell =
  "py-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase"

/**
 * The desktop orders table. The design lays it out as a twelve-column grid; the
 * same proportions are expressed here as column widths on a real `<table>`, so
 * screen readers get row and column semantics for free.
 *
 * Below `md` the page swaps this for `OrdersMobileList` instead of squeezing
 * eight columns into a phone-width scroll area.
 */
export function OrdersTable({ orders }: { orders: readonly OrderSummary[] }) {
  return (
    <Table className="min-w-[880px]">
      <TableHeader>
        <TableRow className="border-border bg-background hover:bg-transparent">
          <TableHead className={cn(headCell, "w-[16%] pl-5")}>
            Order code
          </TableHead>
          <TableHead className={cn(headCell, "w-[18%] px-3")}>
            Customer
          </TableHead>
          <TableHead className={cn(headCell, "w-[8%] px-2 text-center")}>
            Items
          </TableHead>
          <TableHead className={cn(headCell, "w-[11%] px-3 text-right")}>
            Total
          </TableHead>
          <TableHead className={cn(headCell, "w-[14%] pl-3")}>
            Channel
          </TableHead>
          <TableHead className={cn(headCell, "w-[12%] px-3")}>Status</TableHead>
          <TableHead className={cn(headCell, "w-[15%] px-3 text-right")}>
            Created
          </TableHead>
          <TableHead className={cn(headCell, "w-[6%] pr-5 text-right")}>
            •••
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className={cn(
              "h-16 border-border hover:bg-transparent",
              // NEW orders are tinted so the queue that needs a reply reads
              // first, exactly as in the design.
              order.status === "NEW" && "bg-accent/10 hover:bg-accent/15"
            )}
          >
            <TableCell className="pl-5">
              <Link
                to={orderDetailPath(order.code)}
                className="text-sm font-bold text-primary hover:underline"
              >
                {order.code}
              </Link>
              <div className="text-[11px] text-muted-foreground">
                {order.customerPhone}
              </div>
            </TableCell>
            <TableCell className="px-3 font-body text-sm leading-[1.7] text-foreground">
              {order.customerName}
            </TableCell>
            <TableCell className="px-2 text-center text-sm text-foreground">
              {order.itemCount} ထည်
            </TableCell>
            <TableCell className="px-3 text-right text-sm font-bold text-foreground tabular-nums">
              {formatMmk(order.totalMmk)}
            </TableCell>
            <TableCell className="pl-3">
              <ChannelChip channel={order.channel} />
            </TableCell>
            <TableCell className="px-3">
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="px-3 text-right text-xs text-muted-foreground">
              <time dateTime={order.createdAt}>
                {formatOrderTimestamp(order.createdAt)}
              </time>
            </TableCell>
            <TableCell className="pr-5">
              <div className="flex justify-end">
                <OrderRowActions order={order} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
