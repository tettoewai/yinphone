/**
 * Detail rows for `/orders/:code`, generated from the summaries in
 * `orders-mock.ts`.
 *
 * Building the detail from the summary (rather than a second hand-written
 * table) keeps the two screens in agreement: the list's `itemCount` and
 * `totalMmk` are always what the detail screen shows. Items are priced so the
 * lines add up to `totalMmk − delivery`, which means every order needs the
 * totals block regardless of how many units it holds.
 *
 * The first order is arranged to read exactly like the design mock (cotton
 * midi dress and cardigan, Royal delivery, VIP customer in Pabedan); the rest
 * vary by index so the page has something to look at on every row.
 */

import type {
  ActivityEntry,
  Delivery,
  OrderDetail,
  OrderItem,
} from "@/lib/order-details"
import { channelName, type OrderSummary } from "@/lib/orders"
import { ORDERS_MOCK } from "@/lib/orders-mock"

type Product = {
  name: string
  latinName: string
  sku: string
  /** Size and colour options, one picked per order. */
  variants: readonly string[]
}

/** The shop's catalogue as the design mock shows it, plus a few more lines. */
const PRODUCTS: readonly Product[] = [
  {
    name: "ချည်သား Midi ဂါဝန်",
    latinName: "Cotton Midi Dress",
    sku: "DR-014",
    variants: ["Size M • Peach", "Size S • Ivory", "Size L • Rose"],
  },
  {
    name: "ဆွယ်တာ Cardigan",
    latinName: "Knit Cardigan",
    sku: "KN-008",
    variants: ["Free • Cream", "Free • Oat", "Free • Sage"],
  },
  {
    name: "ပိုးသား Blouse",
    latinName: "Silk Blouse",
    sku: "BL-021",
    variants: ["Size M • Pearl", "Size L • Sand"],
  },
  {
    name: "ဂျင်းဘောင်းဘီ",
    latinName: "Wide-leg Jeans",
    sku: "JN-003",
    variants: ["Size 28 • Indigo", "Size 30 • Stone"],
  },
  {
    name: "ဝါဂွမ်း T-shirt",
    latinName: "Cotton Tee",
    sku: "TS-045",
    variants: ["Size M • White", "Size L • Black"],
  },
  {
    name: "ပိတ်ချော စကတ်",
    latinName: "Linen Skirt",
    sku: "SK-017",
    variants: ["Size M • Flax", "Size S • Clay"],
  },
  {
    name: "လုံချည်",
    latinName: "Cotton Longyi",
    sku: "LY-012",
    variants: ["Free • Teal", "Free • Maroon"],
  },
  {
    name: "ချည်သား အင်္ကျီ",
    latinName: "Linen Shirt",
    sku: "SH-009",
    variants: ["Size L • Sage", "Size M • Ecru"],
  },
]

/** Delivery partners the shop uses, in the order the design lists them. */
const COURIERS: readonly Delivery[] = [
  { courier: "Royal • Yangon", feeMmk: 3_500 },
  { courier: "Ninja • Yangon", feeMmk: 4_000 },
  { courier: "Royal • Mandalay", feeMmk: 5_500 },
  { courier: "Ninja • Naypyidaw", feeMmk: 4_500 },
]

const ADDRESSES = [
  "Pabedan • Yangon",
  "Kyauktada • Yangon",
  "Sanchaung • Yangon",
  "Hlaing • Yangon",
  "Mandalay • Chanayethazan",
  "Naypyidaw • Zabuthiri",
] as const

/**
 * Checkout notes, keyed by the order's position in `ORDERS_MOCK`. Only some
 * customers leave one, so the note card is absent from most orders.
 */
const NOTES: Readonly<Record<number, string>> = {
  0: "“စနေနေ့ မနက်ပိုင်း လာယူပါမယ်။ Size M မတော်ရင် L လဲပေးပါနော်။”",
  2: "“ပို့တဲ့အခါ ဖုန်းဆက်ပေးပါ။ ရုံးမှာ ရှိပါတယ်။”",
  5: "“Gift wrap လုပ်ပေးပါ။ ကတ်လေးတွေပါ ထည့်ပေးပါ။”",
  9: "“အရောင်ကို Cream ပြောင်းလို့ရလား? မရရင် ဒါပဲ ပို့ပါ။”",
}

/** The seeded owner. Mock history predates the signed-in session. */
const OWNER_NAME = "Ma Lumi"
const OWNER_ACTOR = `${OWNER_NAME} (Owner)`

const MINUTE_MS = 60_000
const DAY_MS = 86_400_000

/** `items` is never empty here, but indexed access is checked in this project. */
function pick<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length]
  if (!item) throw new Error("pick() needs a non-empty list")
  return item
}

/**
 * Line items priced so they add up to the order total minus delivery.
 *
 * Each unit is its own line (the design shows one line per garment) with the
 * same unit price, rounded down to 500 Ks; the last line absorbs the
 * remainder, which keeps the totals exact without fractional kyat.
 */
function buildItems(
  order: OrderSummary,
  delivery: Delivery,
  index: number
): OrderItem[] {
  const units = Math.max(1, order.itemCount)
  const subtotal = order.totalMmk - delivery.feeMmk
  // Round the per-unit price down to 500 Ks for prices that read like the
  // design's, but keep the raw value when rounding would leave the last line
  // to absorb more than a unit's worth (many cheap units in one order).
  const rawUnit = Math.floor(subtotal / units)
  const unitPrice = rawUnit >= 1_000 ? Math.floor(rawUnit / 500) * 500 : rawUnit

  return Array.from({ length: units }, (_, line) => {
    const product = pick(PRODUCTS, index * 2 + line)
    const price =
      line === units - 1 ? subtotal - unitPrice * (units - 1) : unitPrice

    return {
      id: `${order.id}_item_${line + 1}`,
      name: product.name,
      latinName: product.latinName,
      sku: product.sku,
      variant: pick(product.variants, index),
      quantity: 1,
      unitPriceMmk: price,
    }
  })
}

/** The history the mock pretends happened before the page was opened. */
function buildActivity(order: OrderSummary): ActivityEntry[] {
  const created = new Date(order.createdAt).getTime()
  const channel = channelName(order.channel)

  const entries: ActivityEntry[] = [
    {
      id: `${order.id}_created`,
      title: `Order created via ${channel}`,
      detail: `${channel} မှ မှာယူမှု ဝင်လာသည်`,
      actor: "System",
      at: order.createdAt,
      tone: "accent",
    },
  ]

  const confirmAt = new Date(created + 7 * MINUTE_MS).toISOString()

  if (order.status === "CONFIRMED" || order.status === "DELIVERED") {
    entries.push({
      id: `${order.id}_confirmed`,
      title: `Status → CONFIRMED by ${OWNER_NAME}`,
      detail: "မလူမီ မှ အတည်ပြုခဲ့သည်",
      actor: OWNER_ACTOR,
      at: confirmAt,
      tone: "primary",
    })
  }

  if (order.status === "DELIVERED") {
    entries.push({
      id: `${order.id}_delivered`,
      title: `Status → DELIVERED by ${OWNER_NAME}`,
      detail: "ပစ္စည်း ပို့ပြီးပါပြီ",
      actor: OWNER_ACTOR,
      at: new Date(created + DAY_MS + 2 * 60 * MINUTE_MS).toISOString(),
      tone: "success",
    })
  }

  if (order.status === "CANCELLED") {
    entries.push({
      id: `${order.id}_cancelled`,
      title: `Status → CANCELLED by ${OWNER_NAME}`,
      detail: "ဝယ်သူ တောင်းဆိုမှုဖြင့် ပယ်ဖျက်ခဲ့သည်",
      actor: OWNER_ACTOR,
      at: new Date(created + 45 * MINUTE_MS).toISOString(),
      tone: "muted",
    })
  }

  return entries
}

/** `"မသီရိ နဒီ • Thiri Nadi"` → `"မ"`, for the avatar tile. */
function initialOf(customerName: string) {
  const burmese = customerName.split("•")[0]?.trim() ?? customerName
  return Array.from(burmese)[0] ?? "?"
}

function buildDetail(order: OrderSummary, index: number): OrderDetail {
  const delivery = pick(COURIERS, index)

  return {
    ...order,
    address: pick(ADDRESSES, index),
    customerInitial: initialOf(order.customerName),
    isVip: index % 3 !== 2,
    priorOrderCount: 3 + (index % 4),
    items: buildItems(order, delivery, index),
    delivery,
    note: NOTES[index] ?? null,
    activity: buildActivity(order),
  }
}

export const ORDER_DETAILS: readonly OrderDetail[] =
  ORDERS_MOCK.map(buildDetail)

/** Order codes are the route's new public identifier, so lookup is tolerant of
 * casing and stray spaces (`/orders/yp-2026-0001` works). */
export function findOrderDetail(code: string) {
  const needle = code.trim().toUpperCase()
  return ORDER_DETAILS.find((order) => order.code.toUpperCase() === needle)
}
