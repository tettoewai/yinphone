import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, PackageSearch } from "lucide-react"
import { useCallback, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { useSession } from "@/auth/session-context"
import { ChannelCard } from "@/components/order-details/channel-card"
import { CustomerCard } from "@/components/order-details/customer-card"
import { OrderActivityCard } from "@/components/order-details/order-activity-card"
import { OrderDetailHeader } from "@/components/order-details/order-detail-header"
import { OrderItemsCard } from "@/components/order-details/order-items-card"
import { OrderNoteCard } from "@/components/order-details/order-note-card"
import { StatusCard } from "@/components/order-details/status-card"
import { StatusChangeBanner } from "@/components/order-details/status-change-banner"
import {
  NEXT_ACTION,
  UNDO_SECONDS,
  cancelReasonLabel,
  statusChangeEntry,
  type ActivityEntry,
  type CancelReasonKey,
  type OrderDetail,
} from "@/lib/order-details"
import { findOrderDetail } from "@/lib/order-details-mock"
import type { OrderStatus } from "@/lib/orders"
import { ROUTES } from "@/lib/routes"

/**
 * One order (`/orders/:code`).
 *
 * Everything is local until the orders API exists: the status and the activity
 * log start from `order-details-mock.ts` and are then owned by the view, so a
 * confirmation or cancellation is real to this session (including Undo) but not
 * persisted. Replacing the mock lookup with a `GET /api/orders/:code` call and
 * `applyStatus` with a mutation is the whole integration.
 */
export function OrderDetailsPage() {
  const { code } = useParams<{ code: string }>()
  const order = code ? findOrderDetail(code) : undefined

  // Remounting per order is what resets the local status and log when the
  // route param changes; a synchronising effect would do the same thing later.
  if (!order) return <OrderNotFound code={code ?? ""} />

  return <OrderDetailView key={order.id} order={order} />
}

/** A status change the banner can undo. */
type Change = {
  /** Monotonic per view, so the banner remounts and restarts its countdown. */
  id: number
  status: OrderStatus
  previous: {
    status: OrderStatus
    activity: readonly ActivityEntry[]
  }
}

function OrderDetailView({ order }: { order: OrderDetail }) {
  const { user } = useSession()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [activity, setActivity] = useState<readonly ActivityEntry[]>(
    order.activity
  )
  const [change, setChange] = useState<Change | null>(null)

  const actor = user?.name ?? "Admin"
  const role = user?.role === "OWNER" ? "Owner" : "Staff"

  function applyStatus(next: OrderStatus, reason?: string) {
    setChange({
      id: (change?.id ?? 0) + 1,
      status: next,
      previous: { status, activity },
    })
    setStatus(next)
    setActivity((entries) => [
      ...entries,
      statusChangeEntry({ status: next, actor, role, reason }),
    ])
  }

  const dismissChange = useCallback(() => setChange(null), [])

  const undoChange = useCallback(() => {
    if (!change) return

    setStatus(change.previous.status)
    setActivity(change.previous.activity)
    setChange(null)
  }, [change])

  function advance() {
    const next = NEXT_ACTION[status]
    if (next) applyStatus(next.status)
  }

  function cancel(reason: CancelReasonKey) {
    applyStatus("CANCELLED", cancelReasonLabel(reason))
  }

  return (
    <>
      <OrderDetailHeader order={order} status={status} onAdvance={advance} />

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        {change ? (
          <StatusChangeBanner
            key={change.id}
            status={change.status}
            seconds={UNDO_SECONDS}
            onUndo={undoChange}
            onDismiss={dismissChange}
          />
        ) : null}

        <div className="grid items-start gap-4 lg:grid-cols-3">
          {/* `min-w-0` is load-bearing: without it the items table's
              `min-w-[680px]` widens the whole grid instead of scrolling
              inside its own container on narrow screens. */}
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
            <OrderItemsCard order={order} />
            {order.note ? (
              <OrderNoteCard note={order.note} channel={order.channel} />
            ) : null}
            <OrderActivityCard entries={activity} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <CustomerCard order={order} />
            <ChannelCard channel={order.channel} createdAt={order.createdAt} />
            <StatusCard code={order.code} status={status} onCancel={cancel} />
          </div>
        </div>
      </main>
    </>
  )
}

/**
 * The route's code is user-editable, so an unknown one must not fall through to
 * the catch-all redirect — that would silently land on the dashboard.
 */
function OrderNotFound({ code }: { code: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <span className="flex size-[72px] items-center justify-center rounded-xl bg-secondary">
        <PackageSearch className="size-8 text-primary" strokeWidth={1.5} />
      </span>
      <h1 className="font-body text-xl leading-[1.7] font-bold text-foreground">
        မှာယူမှု ရှာမတွေ့ပါ
      </h1>
      <p className="max-w-[380px] text-sm text-muted-foreground">
        {code
          ? `“${code}” is not in this demo dataset.`
          : "No order code was given."}{" "}
        It may be mistyped, or it only exists in another workspace.
      </p>
      <Link
        to={ROUTES.orders}
        className={cn(
          buttonVariants(),
          "min-h-12 gap-2 px-5 text-sm font-bold"
        )}
      >
        <ArrowLeft className="size-4" strokeWidth={3} />
        Back to orders
      </Link>
    </main>
  )
}
