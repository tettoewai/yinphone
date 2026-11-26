/**
 * Types and pure helpers behind the order-detail screen (`/orders/:code`).
 *
 * Everything extends `OrderSummary` from `lib/orders.ts`, so a row in the list
 * and the detail page describe the same order. `toOrderDetail` maps the API's
 * `GET /api/admin/orders/:code` payload onto this shape, and the page then owns
 * the status and the activity log for the session.
 */

import type { AdminOrderDetail } from "@/lib/api"
import {
  channelName,
  toOrderSummary,
  type OrderStatus,
  type OrderSummary,
} from "@/lib/orders"

/** One line of the items table. */
export type OrderItem = {
  id: string
  /** Burmese product name, e.g. `ချည်သား Midi ဂါဝန်`. */
  name: string
  /** Latin name shown under it, e.g. `Cotton Midi Dress`. Empty when absent. */
  latinName: string
  /** The size picked at checkout: `Size M`, or `One size`. */
  variant: string
  quantity: number
  unitPriceMmk: number
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
  updatedAt: string
  /** Earlier orders this customer placed before this one. */
  priorOrderCount: number
  items: readonly OrderItem[]
  /** Checkout note from the customer, or `null` when there is none. */
  note: string | null
  activity: readonly ActivityEntry[]
}

/** Units in the order, summed from the lines rather than trusted from the
 * summary — the two cannot drift then. */
export function orderItemCount(order: Pick<OrderDetail, "items">) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

/** `"မသီရိ နဒီ • Thiri Nadi"` → `"မ"`, for the customer avatar tile. */
export function customerInitial(customerName: string) {
  const burmese = customerName.split("•")[0]?.trim() ?? customerName
  return Array.from(burmese)[0] ?? "?"
}

/** `Size M`, or `One size` for items such as longyi. */
function variantLabel(size: string | null) {
  return size ? `Size ${size}` : "One size"
}

/**
 * Maps the API's order-detail payload onto the shape the screen renders.
 *
 * The activity log starts with the one entry the server can prove — the order
 * was created — because there is no status audit table yet. Changes made in
 * this session are appended on top of it.
 */
export function toOrderDetail(order: AdminOrderDetail): OrderDetail {
  const summary = toOrderSummary(order)

  return {
    ...summary,
    updatedAt: order.updatedAt,
    priorOrderCount: order.priorOrderCount,
    note: order.note,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.nameMy || item.nameEn,
      latinName: item.nameMy ? item.nameEn : "",
      variant: variantLabel(item.size),
      quantity: item.quantity,
      unitPriceMmk: item.unitPriceMmk,
    })),
    activity: [orderCreatedEntry(summary)],
  }
}

/** The one activity entry the API can account for: creation. */
export function orderCreatedEntry(
  order: Pick<OrderSummary, "id" | "channel" | "createdAt">
): ActivityEntry {
  const channel = channelName(order.channel)

  return {
    id: `${order.id}_created`,
    title: `Order created via ${channel}`,
    detail: ACTIVITY_DETAIL.NEW,
    actor: "System",
    at: order.createdAt,
    tone: "accent",
  }
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
