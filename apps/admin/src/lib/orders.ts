/**
 * Order-list types, presentation meta and the pure helpers behind `/orders`.
 *
 * The shapes mirror the API's Prisma models (`apps/api/prisma/schema.prisma`)
 * so `orders-mock.ts` can be swapped for a real `GET /api/orders` response
 * without touching a component. Nothing here imports React — filtering,
 * counting and paging are plain functions, which keeps them easy to reason
 * about (and cheap to unit-test once the app has a runner).
 */

import { yangonDaysAgo } from "@/lib/yangon-time"

/** Same values as the API's `OrderStatus` enum. */
export type OrderStatus = "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED"

/** Channel slugs seeded in the API (`messenger`, `viber`, `telegram`). */
export type ChannelSlug = "messenger" | "viber" | "telegram"

/** One row of the orders table. A real endpoint returns this shape. */
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

/** Filter selections. `"all"` is the unfiltered value for each facet. */
export type OrderFilters = {
  query: string
  channel: ChannelSlug | "all"
  range: DateRangeKey
  status: OrderStatus | "all"
}

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  query: "",
  channel: "all",
  range: "7d",
  status: "all",
}

export const PAGE_SIZES = [10, 25, 50] as const

export type PageSize = (typeof PAGE_SIZES)[number]

export const DEFAULT_PAGE_SIZE: PageSize = 10

/** A query typed with only phone punctuation is treated as a phone number. */
const PHONE_LIKE = /^[\d\s+()-]+$/

const NON_DIGITS = /\D/g

function digitsOnly(value: string) {
  return value.replace(NON_DIGITS, "")
}

/**
 * Matches the search box: order code, customer name or phone. Phone numbers are
 * stored with spaces, so `09123456789` must find `09 123 456 789`.
 */
export function matchesQuery(order: OrderSummary, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  if (order.code.toLowerCase().includes(needle)) return true
  if (order.customerName.toLowerCase().includes(needle)) return true

  if (!PHONE_LIKE.test(needle)) return false

  const digits = digitsOnly(needle)
  return digits.length > 0 && digitsOnly(order.customerPhone).includes(digits)
}

/** Start of the selected preset, as a UTC instant; `null` for "All time". */
function rangeStart(range: DateRangeKey, now: Date): number | null {
  const days = DATE_RANGES.find((option) => option.key === range)?.days
  if (!days) return null

  return yangonDaysAgo(days - 1, now).getTime()
}

/**
 * Applies every facet except `status`. The status pills count against this
 * result, so their numbers do not collapse to the selected status once one is
 * chosen.
 */
export function filterOrders(
  orders: readonly OrderSummary[],
  filters: Omit<OrderFilters, "status">,
  now: Date
) {
  const since = rangeStart(filters.range, now)

  return orders.filter((order) => {
    if (filters.channel !== "all" && order.channel !== filters.channel) {
      return false
    }

    if (since !== null && new Date(order.createdAt).getTime() < since) {
      return false
    }

    return matchesQuery(order, filters.query)
  })
}

export function statusCounts(
  orders: readonly OrderSummary[]
): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    NEW: 0,
    CONFIRMED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  }

  for (const order of orders) {
    counts[order.status] += 1
  }

  return counts
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number
) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function pageCountFor(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}

/** `"ellipsis"` marks a collapsed gap between page numbers. */
export type PageWindowEntry = number | "ellipsis"

/**
 * Page numbers to render: every page while there are seven or fewer, otherwise
 * the first, the last and the selected page's neighbours.
 */
export function pageWindow(page: number, pageCount: number): PageWindowEntry[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, pageCount])
  for (const candidate of [page - 1, page, page + 1]) {
    if (candidate > 1 && candidate < pageCount) pages.add(candidate)
  }

  const ordered = [...pages].sort((a, b) => a - b)
  const window: PageWindowEntry[] = []
  let previous = 0

  for (const current of ordered) {
    if (current - previous > 1) window.push("ellipsis")
    window.push(current)
    previous = current
  }

  return window
}
