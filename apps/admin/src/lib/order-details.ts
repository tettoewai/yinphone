/**
 * Types and pure helpers behind the order-detail screen (`/orders/:code`).
 *
 * Everything extends `OrderSummary` from `lib/orders.ts`, so a row in the list
 * and the detail page describe the same order. As with the list, the shapes
 * mirror the API's Prisma models — `orders-mock.ts` and `order-details-mock.ts`
 * are the only places that know the data is fake.
 */

import type { OrderStatus, OrderSummary } from "@/lib/orders"

/** One line of the items table. `quantity` is always 1 today, but the API's
 * order items carry a quantity and the totals must not assume otherwise. */
export type OrderItem = {
  id: string
  /** Burmese product name, e.g. `ချည်သား Midi ဂါဝန်`. */
  name: string
  /** Latin name shown under it, e.g. `Cotton Midi Dress`. */
  latinName: string
  sku: string
  /** Size and colour, as picked at checkout: `Size M • Peach`. */
  variant: string
  quantity: number
  unitPriceMmk: number
}

/** The courier and its fee. Kept separate from `totalMmk` so the totals block
 * can show the breakdown the design asks for. */
export type Delivery = {
  courier: string
  feeMmk: number
}

export type ActivityTone = "accent" | "primary" | "success" | "muted"

/** One entry of the activity log, newest at the bottom. */
export type ActivityEntry = {
  id: string
  /** Latin headline, e.g. `Status → CONFIRMED by Ma Lumi`. */
  title: string
  /** The Burmese one-liner under it. */
  detail: string
  /** Who caused it: `System`, or `Ma Lumi (Owner)`. */
  actor: string
  /** ISO 8601, rendered in Asia/Yangon. */
  at: string
  /** The dot beside the entry. */
  tone: ActivityTone
}

/** An order plus everything the detail screen needs that the list does not. */
export type OrderDetail = OrderSummary & {
  /** Township and city, e.g. `Pabedan • Yangon`. */
  address: string
  /** First glyph of the Burmese name, for the customer avatar. */
  customerInitial: string
  isVip: boolean
  /** Orders this customer placed before this one. */
  priorOrderCount: number
  items: readonly OrderItem[]
  delivery: Delivery
  /** Checkout note from the customer, or `null` when there is none. */
  note: string | null
  activity: readonly ActivityEntry[]
}

export function orderSubtotal(order: Pick<OrderDetail, "items">) {
  return order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceMmk,
    0
  )
}

/** Units in the order, summed from the lines rather than trusted from the
 * summary — the two cannot drift then. */
export function orderItemCount(order: Pick<OrderDetail, "items">) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * The happy path shown in the status stepper. A cancelled order leaves it
 * entirely, which is why `statusStep` returns `-1` for `CANCELLED`.
 */
export const STATUS_FLOW = ["NEW", "CONFIRMED", "DELIVERED"] as const

export type FlowStatus = (typeof STATUS_FLOW)[number]

/** Latin labels under the three stepper nodes. */
export const STEP_LABELS: Record<FlowStatus, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  DELIVERED: "Delivered",
}

/** Index in `STATUS_FLOW`, or `-1` for a cancelled order. */
export function statusStep(status: OrderStatus) {
  return STATUS_FLOW.indexOf(status as FlowStatus)
}

/** The one status a NEW or CONFIRMED order can move to next. */
export type NextAction = {
  status: FlowStatus
  /** Burmese label on the primary button, as in the design. */
  label: string
}

export const NEXT_ACTION: Partial<Record<OrderStatus, NextAction>> = {
  NEW: { status: "CONFIRMED", label: "အတည်ပြုပြီးဟု သတ်မှတ်ရန်" },
  CONFIRMED: { status: "DELIVERED", label: "ပို့ပြီးဟု သတ်မှတ်ရန်" },
}

/** Burmese one-liners for the activity log. */
export const ACTIVITY_DETAIL: Record<OrderStatus, string> = {
  NEW: "မှာယူမှု အသစ် ဝင်လာသည်",
  CONFIRMED: "အတည်ပြုပြီးအဖြစ် သတ်မှတ်ခဲ့သည်",
  DELIVERED: "ပစ္စည်း ပို့ပြီးပါပြီ",
  CANCELLED: "မှာယူမှုကို ပယ်ဖျက်ခဲ့သည်",
}

/** The dot colour for a status change, matching the status badges. */
export function activityTone(status: OrderStatus): ActivityTone {
  if (status === "NEW") return "accent"
  if (status === "CONFIRMED") return "primary"
  if (status === "DELIVERED") return "success"
  return "muted"
}

export const ACTIVITY_DOT: Record<ActivityTone, string> = {
  accent: "bg-accent",
  primary: "bg-primary",
  success: "bg-success",
  muted: "bg-muted-foreground",
}

/** Why an order was cancelled. Required by the confirmation dialog. */
export const CANCEL_REASONS = [
  { key: "out-of-stock", label: "ပစ္စည်း ကုန်နေသည် • Out of stock" },
  { key: "customer-request", label: "ဝယ်သူ တောင်းဆိုသည် • Customer request" },
  { key: "no-reply", label: "ဝယ်သူ ဆက်သွယ်၍ မရ • No reply" },
  { key: "duplicate", label: "ထပ်နေသော မှာယူမှု • Duplicate order" },
  { key: "other", label: "အခြား • Other" },
] as const

export type CancelReasonKey = (typeof CANCEL_REASONS)[number]["key"]

export function cancelReasonLabel(key: CancelReasonKey) {
  return CANCEL_REASONS.find((reason) => reason.key === key)?.label ?? key
}

/** How long the status banner keeps its Undo action. */
export const UNDO_SECONDS = 10

let localEntryCount = 0

/**
 * The activity entry a local status change appends. Ids are generated here so
 * the page never has to invent one; the counter keeps ids unique even when two
 * changes land in the same millisecond.
 */
export function statusChangeEntry({
  status,
  actor,
  role,
  reason,
}: {
  status: OrderStatus
  actor: string
  /** `Owner` or `Staff`, shown beside the name. */
  role: string
  reason?: string
}) {
  localEntryCount += 1

  const detail = reason
    ? `${ACTIVITY_DETAIL[status]} • ${reason}`
    : ACTIVITY_DETAIL[status]

  return {
    id: `local_${localEntryCount}`,
    title: `Status → ${status} by ${actor}`,
    detail,
    actor: `${actor} (${role})`,
    at: new Date().toISOString(),
    tone: activityTone(status),
  } satisfies ActivityEntry
}
