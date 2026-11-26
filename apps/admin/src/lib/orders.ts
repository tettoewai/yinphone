/**
 * Order-list types, presentation meta and the pure helpers behind `/orders`.
 *
 * The API (`/api/admin/orders`) owns filtering and paging now, so this module
 * holds only what the screens need to render: the row shape, the status and
 * channel metadata, the date presets, page sizes, and the mapping from an API
 * row onto `OrderSummary`. Nothing here imports React.
 */

import type { AdminOrderSummary } from "@/lib/api"

/** Same values as the API's `OrderStatus` enum. */
export type OrderStatus = "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED"

/** Channel slugs the admin screens know how to render. */
export type ChannelSlug = "messenger" | "viber" | "telegram"

/** One row of the orders table. `GET /api/admin/orders` returns this shape. */
export type OrderSummary = {
  id: string
  /** Human-facing code, e.g. `YP-2026-0024`. */
  code: string
  /** Burmese name • Latin name, as the shop records both. */
  customerName: string
  /** Display form with spaces, e.g. `09 123 456 789`. */
  customerPhone: string
  /** Units in the order, shown as `2 ထည်`. */
  itemCount: number
  totalMmk: number
  channel: ChannelSlug
  status: OrderStatus
  /** ISO 8601. Always rendered in Asia/Yangon, never in the browser's zone. */
  createdAt: string
}

export const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[]

export type StatusMeta = {
  /** Burmese label used on the filter pills. */
  label: string
  /** Latin label used on the filter pills. */
  labelEn: string
  /** The dot on the filter pill. */
  dotClassName: string
  /** Shared `Badge` variant carrying the same colour as the dot. */
  badgeVariant: "new" | "confirmed" | "delivered" | "cancelled"
}

/**
 * Status colours, matching the dashboard's recent-orders table: accent for the
 * work still to do, primary for confirmed, success for delivered and muted for
 * the dead end.
 */
export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  NEW: {
    label: "အသစ်",
    labelEn: "New",
    dotClassName: "bg-accent",
    badgeVariant: "new",
  },
  CONFIRMED: {
    label: "အတည်ပြု",
    labelEn: "Confirmed",
    dotClassName: "bg-primary",
    badgeVariant: "confirmed",
  },
  DELIVERED: {
    label: "ပို့ပြီး",
    labelEn: "Delivered",
    dotClassName: "bg-success",
    badgeVariant: "delivered",
  },
  CANCELLED: {
    label: "ပယ်ဖျက်",
    labelEn: "Cancelled",
    dotClassName: "bg-muted",
    badgeVariant: "cancelled",
  },
}

const CHANNEL_NAMES: Record<ChannelSlug, string> = {
  messenger: "Messenger",
  viber: "Viber",
  telegram: "Telegram",
}

/** Channels in the order the design lists them. */
export const CHANNELS: readonly ChannelSlug[] = [
  "messenger",
  "viber",
  "telegram",
]

export function channelName(channel: ChannelSlug) {
  return CHANNEL_NAMES[channel]
}

/**
 * Where a channel conversation lives. The handles are placeholders until the
 * channels screen can store the shop's real public links.
 */
const CHANNEL_CONTACT: Record<ChannelSlug, { handle: string; url: string }> = {
  messenger: { handle: "m.me/yinphone", url: "https://m.me/yinphone" },
  viber: {
    handle: "viber.com/yinphone",
    url: "https://www.viber.com/yinphone",
  },
  telegram: { handle: "t.me/yinphone", url: "https://t.me/yinphone" },
}

export function channelContact(channel: ChannelSlug) {
  return CHANNEL_CONTACT[channel]
}

/**
 * Solid brand background for the channel buttons on the order-detail screen.
 * Written out in full so Tailwind can see every class.
 */
export const CHANNEL_BG: Record<ChannelSlug, string> = {
  messenger: "bg-messenger",
  viber: "bg-viber",
  telegram: "bg-telegram",
}

/** Whether an API channel slug is one the screens know how to draw. */
export function isChannelSlug(value: string): value is ChannelSlug {
  return (CHANNELS as readonly string[]).includes(value)
}

/**
 * Narrows an API channel slug to one with an icon and a colour. The seed ships
 * exactly the three channels above; when the channels screen can add more, the
 * icon and colour maps are what need widening.
 */
export function toChannelSlug(slug: string): ChannelSlug {
  return isChannelSlug(slug) ? slug : "messenger"
}

/** Maps a `GET /api/admin/orders` row onto the shape the screens render. */
export function toOrderSummary(order: AdminOrderSummary): OrderSummary {
  return {
    id: order.id,
    code: order.code,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    itemCount: order.itemCount,
    totalMmk: order.totalMmk,
    channel: toChannelSlug(order.channel),
    status: order.status,
    createdAt: order.createdAt,
  }
}

/**
 * Date presets. `days` counts calendar days including today, so `7` means
 * "today and the six days before it" in Asia/Yangon. `null` means no bound.
 */
export type DateRangeKey = "today" | "7d" | "30d" | "all"

export type DateRange = {
  key: DateRangeKey
  label: string
  days: number | null
}

export const DATE_RANGES: readonly DateRange[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "all", label: "All time", days: null },
]

export function dateRangeLabel(range: DateRangeKey) {
  return (
    DATE_RANGES.find((option) => option.key === range)?.label ?? "Last 7 days"
  )
}

export const PAGE_SIZES = [10, 25, 50] as const

export type PageSize = (typeof PAGE_SIZES)[number]

export const DEFAULT_PAGE_SIZE: PageSize = 10
