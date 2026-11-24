import { Badge } from "@workspace/ui/components/badge"

import { STATUS_META, type OrderStatus } from "@/lib/orders"

/**
 * The status chip from the design: a solid tone, a 6px dot and the enum value
 * in caps. The tone comes from the shared `Badge` variants, so the dashboard's
 * recent-orders table and this screen can never drift apart.
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant={STATUS_META[status].badgeVariant}
      className="h-auto gap-1.5 rounded-sm px-2.5 py-1 font-bold"
    >
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-xl bg-current"
      />
      {status}
    </Badge>
  )
}
