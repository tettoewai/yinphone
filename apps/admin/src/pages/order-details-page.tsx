import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, PackageSearch } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { useSession } from "@/auth/session-context"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { FormAlert } from "@/components/form-alert"
import { ChannelCard } from "@/components/order-details/channel-card"
import { CustomerCard } from "@/components/order-details/customer-card"
import { OrderActivityCard } from "@/components/order-details/order-activity-card"
import { OrderDetailHeader } from "@/components/order-details/order-detail-header"
import { OrderItemsCard } from "@/components/order-details/order-items-card"
import { OrderNoteCard } from "@/components/order-details/order-note-card"
import { StatusCard } from "@/components/order-details/status-card"
import { StatusChangeBanner } from "@/components/order-details/status-change-banner"
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useOrderDetail } from "@/hooks/use-orders"
import { ApiError, ordersApi } from "@/lib/api"
import {
  NEXT_ACTION,
  UNDO_SECONDS,
  cancelReasonLabel,
  statusChangeEntry,
  toOrderDetail,
  type ActivityEntry,
  type CancelReasonKey,
  type OrderDetail,
} from "@/lib/order-details"
import type { OrderStatus } from "@/lib/orders"
import { ROUTES } from "@/lib/routes"

/**
 * One order (`/orders/:code`).
 *
 * The order comes from `GET /api/admin/orders/:code`. A status change is a
 * `PATCH` immediately, and the banner's Undo patches the previous status back,
 * so what the screen shows is what the server has. The activity log starts with
 * the entry the API can prove (the order was created) and then records the
 * changes this session made.
 */
export function OrderDetailsPage() {
  const { code } = useParams<{ code: string }>()
  const { order: payload, error, loading, reload } = useOrderDetail(code)

  const order = useMemo(
    () => (payload ? toOrderDetail(payload) : null),
    [payload]
  )

  if (loading) return <DetailSkeleton />

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <OrderNotFound code={code ?? ""} />
    }

    return (
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6">
        <RequestError
          detail={error instanceof ApiError ? error.message : undefined}
          onRetry={reload}
          className="w-full max-w-[520px]"
        />
      </main>
    )
  }

  if (!order) return <OrderNotFound code={code ?? ""} />

  // Remounting per order resets the status and log when the route changes.
  return <OrderDetailView key={order.id} order={order} />
}

function DetailSkeleton() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6"
    >
      <span className="sr-only">ခဏစောင့်ပါ… • Loading…</span>
      <TableSkeleton rows={3} />
      <TableSkeleton rows={2} />
    </main>
  )
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
  // Confirming or cancelling changes the NEW count the sidebar chip shows.
  const { reload: reloadDashboard } = useDashboard()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [activity, setActivity] = useState<readonly ActivityEntry[]>(
    order.activity
  )
  const [change, setChange] = useState<Change | null>(null)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const actor = user?.name ?? "Admin"
  const role = user?.role === "OWNER" ? "Owner" : "Staff"

  async function applyStatus(next: OrderStatus, reason?: string) {
    if (pending || next === status) return

    setPending(true)
    setFailure(null)

    const previous = { status, activity }

    try {
      const updated = await ordersApi.updateStatus(order.code, next)

      setChange({ id: (change?.id ?? 0) + 1, status: next, previous })
      setStatus(updated.status)
      setActivity((entries) => [
        ...entries,
        statusChangeEntry({ status: next, actor, role, reason }),
      ])
      reloadDashboard()
    } catch (error) {
      setFailure(messageFor(error))
    } finally {
      setPending(false)
    }
  }

  const dismissChange = useCallback(() => setChange(null), [])

  const undoChange = useCallback(() => {
    if (!change || pending) return

    const previous = change.previous
    setPending(true)
    setFailure(null)

    ordersApi
      .updateStatus(order.code, previous.status)
      .then(() => {
        setStatus(previous.status)
        setActivity(previous.activity)
        setChange(null)
        reloadDashboard()
      })
      .catch((error: unknown) => setFailure(messageFor(error)))
      .finally(() => setPending(false))
  }, [change, order.code, pending, reloadDashboard])

  function advance() {
    const next = NEXT_ACTION[status]
    if (next) void applyStatus(next.status)
  }

  function cancel(reason: CancelReasonKey) {
    void applyStatus("CANCELLED", cancelReasonLabel(reason))
  }

  return (
    <>
      <OrderDetailHeader order={order} status={status} onAdvance={advance} />

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        {failure ? (
          <FormAlert
            title="အခြေအနေ မပြောင်းနိုင်ပါ • Could not update status"
            detail={failure}
          />
        ) : null}

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

function messageFor(error: unknown) {
  if (error instanceof ApiError) return error.message
  return "Something went wrong. Please try again."
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
        {code ? `“${code}” does not exist.` : "No order code was given."} It may
        be mistyped, or it belongs to another shop.
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
