/**
 * Dashboard types and the pure helpers behind `/dashboard`.
 *
 * The API (`GET /api/admin/dashboard`) owns the counting and the day buckets, so
 * this module only maps an API payload onto the shapes the panels render and
 * supplies the two display rules — the chart's axis ceiling and how a recent
 * order's time reads. Nothing here imports React.
 */

import type {
  AdminDashboardChannel,
  AdminDashboardDay,
  AdminDashboardRecentOrder,
} from "@/lib/api"
import type { OrderStatus } from "@/lib/orders"
import {
  formatClockTime,
  formatDayMonth,
  startOfYangonDay,
} from "@/lib/yangon-time"

/** Public storefront. Placeholder until shop settings carry the real URL. */
export const SHOP_URL = "http://localhost:3000"

const MS_PER_DAY = 86_400_000

/** One column of the seven-day sales chart. */
export type DailySales = {
  /** `YYYY-MM-DD` in Asia/Yangon. */
  date: string
  /** Day-of-month shown under the bar, e.g. "13". */
  day: string
  amountMmk: number
}

/** One slice of the channel split. */
export type ChannelShare = {
  slug: string
  name: string
  orders: number
  /** Rounded share of the window's orders. */
  sharePct: number
}

/** One row of the dashboard's recent-orders table. */
export type RecentOrder = {
  id: string
  code: string
  customerName: string
  totalMmk: number
  /** Channel label, e.g. "Messenger". */
  channel: string
  status: OrderStatus
  /** "10:24 AM", "Yesterday" or "18 Nov", in Asia/Yangon. */
  timeLabel: string
}

/** A week of daily takings, oldest first. */
export function toDailySales(days: readonly AdminDashboardDay[]): DailySales[] {
  return days.map((day) => ({
    date: day.date,
    day: day.day,
    amountMmk: day.amountMmk,
  }))
}

/**
 * Channel slices ordered as the API sends them. The label is the English name,
 * which is what the design prints; Burmese-only channels fall back to `nameMy`.
 */
export function toChannelShares(
  channels: readonly AdminDashboardChannel[]
): ChannelShare[] {
  return channels.map((channel) => ({
    slug: channel.slug,
    name: channel.nameEn || channel.nameMy,
    orders: channel.orders,
    sharePct: channel.sharePct,
  }))
}

/** Maps the API rows onto the table shape, resolving each timestamp. */
export function toRecentOrders(
  orders: readonly AdminDashboardRecentOrder[],
  now: Date
): RecentOrder[] {
  return orders.map((order) => ({
    id: order.id,
    code: order.code,
    customerName: order.customerName,
    totalMmk: order.totalMmk,
    channel: order.channel,
    status: order.status,
    timeLabel: recentOrderTimeLabel(order.createdAt, now),
  }))
}

/**
 * How a recent order's timestamp reads: the clock time for today, "Yesterday"
 * for the day before, and a bare "18 Nov" for anything older.
 */
export function recentOrderTimeLabel(value: string | Date, now: Date) {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"

  const days =
    (startOfYangonDay(now).getTime() - startOfYangonDay(date).getTime()) /
    MS_PER_DAY

  if (days <= 0) return formatClockTime(date)
  if (days === 1) return "Yesterday"

  return formatDayMonth(date)
}

/** "—" / "+3 vs yesterday" / "2 vs yesterday" for the orders KPI caption. */
export function formatOrderDelta(today: number, yesterday: number) {
  const delta = today - yesterday
  if (delta === 0) return "same as yesterday"

  return delta > 0 ? `+${delta} vs yesterday` : `${delta} vs yesterday`
}

/**
 * A round ceiling for the chart axis, so bars are drawn against whole numbers
 * (1, 2, 5 × a power of ten) instead of hugging the tallest day.
 */
function niceCeiling(value: number) {
  if (value <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10

  return step * magnitude
}

/** Axis maximum for the sales chart, given the tallest day. */
export function salesAxisMax(peakMmk: number) {
  return niceCeiling(peakMmk)
}
