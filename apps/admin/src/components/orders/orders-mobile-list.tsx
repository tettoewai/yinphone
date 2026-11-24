import { Link } from "react-router-dom"

import { OrderRowActions } from "@/components/orders/order-row-actions"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatMmk } from "@/lib/format"
import { channelName, type OrderSummary } from "@/lib/orders"
import { orderDetailPath } from "@/lib/routes"
import { formatOrderTime } from "@/lib/yangon-time"

/**
 * The design's mobile order card: code and status on top, customer underneath,
 * total and channel/time on the bottom row. The code links to the detail
 * screen, and the row menu rides along so the card has the same actions as the
 * table row.
 */
export function OrdersMobileList({
  orders,
}: {
  orders: readonly OrderSummary[]
}) {
  return (
    <ul className="flex flex-col gap-3 p-3">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-lg border border-border bg-background p-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <Link
              to={orderDetailPath(order.code)}
              className="text-sm font-bold text-primary hover:underline"
            >
              {order.code}
            </Link>
            <span className="flex items-center gap-1.5">
              <OrderStatusBadge status={order.status} />
              <OrderRowActions order={order} />
            </span>
          </div>

          <div className="mt-1 font-body text-sm text-foreground">
            {order.customerName} • {order.customerPhone}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatMmk(order.totalMmk)}
            </span>
            <span className="text-xs text-muted-foreground">
              {channelName(order.channel)} • {formatOrderTime(order.createdAt)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
