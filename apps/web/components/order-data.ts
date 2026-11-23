import type { Locale } from "next-intl"

import { formatDigits, formatPrice } from "@/lib/format"

export const MIN_ORDER_QTY = 1
export const MAX_ORDER_QTY = 5

export type OrderDraft = {
  /** Product name in the active locale — for the on-screen summary line. */
  title: string
  /** Myanmar name. The shop-facing message is never translated. */
  shopTitle: string
  unitPrice: number
  qty: number
  size?: string
  colorName?: string
}

export type OrderMessageOptions = {
  code?: string
  customerName?: string
  customerPhone?: string
  productUrl?: string
}

export function getOrderTotal(draft: Pick<OrderDraft, "unitPrice" | "qty">) {
  return draft.unitPrice * draft.qty
}

/**
 * Single truncated line shown inside the summary card, in the customer's
 * language, e.g. `မှာယူချက်: Cotton Midi Dress x၂ (M) - ၉၀,၀၀၀ Ks`.
 */
export function buildOrderLine(
  draft: OrderDraft,
  locale: Locale,
  label: string
) {
  const size = draft.size ? ` (${draft.size})` : ""

  return `${label}: ${draft.title} x${formatDigits(draft.qty, locale)}${size} - ${formatPrice(
    getOrderTotal(draft),
    locale
  )}`
}

/**
 * Multi-line message the customer sends to the shop in chat. Always Myanmar,
 * with Myanmar digits, because the shop reads it — regardless of the locale the
 * customer browsed in.
 */
export function buildOrderMessage(
  draft: OrderDraft,
  options: OrderMessageOptions = {}
) {
  const selection = [
    draft.size ? `Size ${draft.size}` : null,
    `Qty ${draft.qty}`,
  ]
    .filter(Boolean)
    .join(" • ")
  const customer = [
    options.customerName ? `Name: ${options.customerName}` : null,
    options.customerPhone ? `Phone: ${options.customerPhone}` : null,
  ]

  return [
    "မှာယူချက်",
    options.code ? `Order ${options.code}` : null,
    "",
    draft.shopTitle,
    draft.colorName ?? null,
    selection,
    ...customer,
    `Total: ${formatPrice(getOrderTotal(draft), "my")}`,
    options.productUrl ?? null,
    "",
    "— YinPhone Boutique Yangon",
  ]
    .filter((line): line is string => line !== null)
    .join("\n")
}
