import { formatPrice } from "@/components/catalog-data"

export const MIN_ORDER_QTY = 1
export const MAX_ORDER_QTY = 5

export type OrderDraft = {
  title: string
  subtitle: string
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
 * Single truncated line shown inside the summary card, e.g.
 * `မှာယူချက်: Cotton Midi Dress x2 (M) - 90,000 Ks`.
 */
export function buildOrderLine(draft: OrderDraft) {
  const size = draft.size ? ` (${draft.size})` : ""

  return `မှာယူချက်: ${draft.subtitle} x${draft.qty}${size} - ${formatPrice(
    getOrderTotal(draft)
  )}`
}

/** Multi-line message the customer sends to the shop in chat. */
export function buildOrderMessage(
  draft: OrderDraft,
  options: OrderMessageOptions = {}
) {
  const variant = [draft.subtitle, draft.colorName].filter(Boolean).join(" • ")
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
    "မှာယူချက် • Order summary",
    options.code ? `Order ${options.code}` : null,
    "",
    draft.title,
    variant,
    selection,
    ...customer,
    `Total: ${formatPrice(getOrderTotal(draft))}`,
    options.productUrl ?? null,
    "",
    "— YinPhone Boutique Yangon",
  ]
    .filter((line): line is string => line !== null)
    .join("\n")
}
