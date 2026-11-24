import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Check, Printer } from "lucide-react"
import { Link } from "react-router-dom"

import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { NEXT_ACTION, type OrderDetail } from "@/lib/order-details"
import { channelName, type OrderStatus } from "@/lib/orders"
import { ROUTES } from "@/lib/routes"
import { formatOrderPlaced } from "@/lib/yangon-time"

type OrderDetailHeaderProps = {
  order: OrderDetail
  status: OrderStatus
  /** Moves the order along the happy path (NEW → CONFIRMED → DELIVERED). */
  onAdvance: () => void
}

/**
 * Title block of the detail screen: the way back, the code, its status and the
 * timestamps on the left; Print and the one status action on the right. The
 * breadcrumb above it belongs to `AdminTopbar`, which knows the route.
 */
export function OrderDetailHeader({
  order,
  status,
  onAdvance,
}: OrderDetailHeaderProps) {
  const next = NEXT_ACTION[status]

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            to={ROUTES.orders}
            className="flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="size-4" strokeWidth={3} />
            <span className="font-body">မှာယူမှုများသို့ ပြန်ရန်</span>
            <span className="text-xs font-normal text-muted-foreground">
              • Back to Orders
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl leading-tight font-bold text-foreground sm:text-3xl">
              {order.code}
            </h1>
            <OrderStatusBadge status={status} />
          </div>

          <p className="text-xs text-muted-foreground">
            Placed {formatOrderPlaced(order.createdAt)} • Asia/Yangon • via{" "}
            {channelName(order.channel)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="min-h-12 gap-1.5 px-4 text-sm font-semibold"
          >
            <Printer className="size-4" strokeWidth={3} />
            Print
          </Button>
          {next ? (
            <Button
              onClick={onAdvance}
              className="min-h-12 gap-2 px-5 text-sm font-bold"
            >
              <Check className="size-4" strokeWidth={3} />
              {next.label}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
