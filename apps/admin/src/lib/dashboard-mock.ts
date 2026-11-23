/**
 * Placeholder data for the dashboard overview.
 *
 * The shapes mirror the API's Prisma models (`apps/api/prisma/schema.prisma`)
 * so this page can swap these constants for real responses once the stats
 * endpoints land — nothing here is fetched yet.
 */

/** Same values as the API's `OrderStatus` enum. */
export type OrderStatus = "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED"

/** Channel slugs seeded in the API (`messenger`, `viber`, `telegram`). */
export type ChannelSlug = "messenger" | "viber" | "telegram"

/** Public storefront. Placeholder until shop settings carry the real URL. */
export const SHOP_URL = "http://localhost:3000"

export type DailySales = {
  /** Day-of-month shown under the bar, e.g. "13". */
  day: string
  amountMmk: number
}

/**
 * Bars are drawn against a flat 100,000 Ks axis, so the 95k day is the one that
 * nearly fills the chart. A real endpoint should return the axis maximum too.
 */
export const SALES_AXIS_MMK = 100_000

/** Last seven days, oldest first. */
export const SALES_LAST_7_DAYS: readonly DailySales[] = [
  { day: "13", amountMmk: 42_000 },
  { day: "14", amountMmk: 65_000 },
  { day: "15", amountMmk: 38_000 },
  { day: "16", amountMmk: 80_000 },
  { day: "17", amountMmk: 55_000 },
  { day: "18", amountMmk: 95_000 },
  { day: "19", amountMmk: 72_000 },
]

export type ChannelShare = {
  slug: ChannelSlug
  name: string
  orders: number
  /** Rounded share of the week's orders. */
  sharePct: number
}

export const CHANNEL_SHARES: readonly ChannelShare[] = [
  { slug: "messenger", name: "Messenger", orders: 48, sharePct: 56 },
  { slug: "viber", name: "Viber", orders: 24, sharePct: 28 },
  { slug: "telegram", name: "Telegram", orders: 14, sharePct: 16 },
]

export type RecentOrder = {
  code: string
  /** Burmese name • Latin name, as the shop records both. */
  customerName: string
  totalMmk: number
  channel: string
  status: OrderStatus
  /** Display label only — a real row formats `createdAt` instead. */
  timeLabel: string
}

export const RECENT_ORDERS: readonly RecentOrder[] = [
  {
    code: "YP-1042",
    customerName: "မသီရိ • Thiri",
    totalMmk: 90_000,
    channel: "Messenger",
    status: "NEW",
    timeLabel: "10:24 AM",
  },
  {
    code: "YP-1041",
    customerName: "မအေး • Aye Chan",
    totalMmk: 45_000,
    channel: "Viber",
    status: "NEW",
    timeLabel: "09:51 AM",
  },
  {
    code: "YP-1040",
    customerName: "ကိုမင်း • Min Khant",
    totalMmk: 128_000,
    channel: "Telegram",
    status: "CONFIRMED",
    timeLabel: "Yesterday",
  },
  {
    code: "YP-1039",
    customerName: "မလှိုင် • Hlaing",
    totalMmk: 62_500,
    channel: "Messenger",
    status: "DELIVERED",
    timeLabel: "Yesterday",
  },
  {
    code: "YP-1038",
    customerName: "မဆု • Su Myat",
    totalMmk: 39_500,
    channel: "Viber",
    status: "CANCELLED",
    timeLabel: "18 Nov",
  },
]
