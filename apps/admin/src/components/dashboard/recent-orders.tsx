import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRight, Check, Copy, Store } from "lucide-react"
import { useEffect, useState } from "react"

import {
  SHOP_URL,
  type OrderStatus,
  type RecentOrder,
} from "@/lib/dashboard-mock"
import { formatMmk } from "@/lib/format"

const STATUS_STYLE: Record<OrderStatus, string> = {
  NEW: "bg-accent text-accent-foreground",
  CONFIRMED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-bold",
        STATUS_STYLE[status]
      )}
    >
      <span className="inline-block size-1.5 rounded-xl bg-current" />
      {status}
    </span>
  )
}

const headCell =
  "py-2.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase"

/** The five most recent orders, with the same columns as the orders screen. */
export function RecentOrders({ orders }: { orders: readonly RecentOrder[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div>
          <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
            နောက်ဆုံး မှာယူမှုများ
          </h2>
          <p className="text-xs text-muted-foreground">
            Recent orders • {orders.length} latest • Asia/Yangon time
          </p>
        </div>
        <Button
          variant="ghost"
          disabled
          title="Coming soon"
          className="min-h-11 gap-1.5 px-4 text-sm font-bold text-primary"
        >
          View all orders
          <ArrowRight className="size-[15px]" strokeWidth={3.2} />
        </Button>
      </div>

      {/* Narrow screens scroll the table instead of squeezing six columns. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th
                scope="col"
                className={cn(headCell, "w-[17%] pl-5 text-left")}
              >
                Code
              </th>
              <th
                scope="col"
                className={cn(headCell, "w-[25%] px-3 text-left")}
              >
                Customer
              </th>
              <th
                scope="col"
                className={cn(headCell, "w-[16%] px-3 text-right")}
              >
                Total
              </th>
              <th
                scope="col"
                className={cn(headCell, "w-[16%] px-3 text-left")}
              >
                Channel
              </th>
              <th
                scope="col"
                className={cn(headCell, "w-[18%] px-3 text-left")}
              >
                Status
              </th>
              <th
                scope="col"
                className={cn(headCell, "w-[8%] pr-5 text-right")}
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.code}
                className="h-14 border-b border-border last:border-b-0"
              >
                <td className="pl-5 font-bold text-primary">{order.code}</td>
                <td className="px-3 font-body leading-[1.7] text-foreground">
                  {order.customerName}
                </td>
                <td className="px-3 text-right font-bold text-foreground tabular-nums">
                  {formatMmk(order.totalMmk)}
                </td>
                <td className="px-3 text-[13px] text-muted-foreground">
                  {order.channel}
                </td>
                <td className="px-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="pr-5 text-right text-xs text-muted-foreground">
                  {order.timeLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/**
 * The dashboard's empty variant: what a brand-new shop sees before its first
 * order. Copying the shop link is the only action that works without a backend.
 */
export function OrdersEmptyState() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle"
  )

  useEffect(() => {
    if (copyState === "idle") return

    const timer = window.setTimeout(() => setCopyState("idle"), 2400)
    return () => window.clearTimeout(timer)
  }, [copyState])

  async function copyShopLink() {
    try {
      await navigator.clipboard.writeText(SHOP_URL)
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    }
  }

  const label =
    copyState === "copied"
      ? "Copied"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy shop link"

  return (
    <section className="flex flex-wrap items-center gap-5 rounded-lg border-2 border-dashed border-border bg-card px-6 py-6">
      <span className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-secondary">
        <Store className="size-8 text-primary" strokeWidth={1.5} />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
          မှာယူမှု မရှိသေးပါ
        </h2>
        <p className="text-sm text-muted-foreground">
          No orders yet. Share your shop link to get started.
        </p>
      </div>

      <Button
        onClick={() => void copyShopLink()}
        className="min-h-12 shrink-0 gap-2 px-5 text-sm font-bold"
      >
        {copyState === "copied" ? (
          <Check className="size-[15px]" strokeWidth={3.2} />
        ) : (
          <Copy className="size-[15px]" strokeWidth={3.2} />
        )}
        <span aria-live="polite">{label}</span>
      </Button>
    </section>
  )
}
