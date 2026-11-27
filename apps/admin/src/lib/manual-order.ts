/**
 * Draft model and pure helpers behind "Manual order" on `/orders`.
 *
 * Staff record chat orders here, so the form mirrors `POST /api/admin/orders`:
 * a customer, the channel the order arrived on, and one or more product lines.
 * Prices are never part of the request — the API reads them from the catalogue —
 * so the total below is only a preview, computed from the same rows the picker
 * shows. Nothing here imports React.
 */

import type {
  AdminOrderSize,
  AdminProductSummary,
  CreateOrderBody,
} from "@/lib/api"

/** One row of the line editor. `size` is `null` for one-size products. */
export type ManualOrderLine = {
  /** Local identity for React keys and updates; never sent. */
  key: string
  /** Empty until a product is chosen. */
  productId: string
  size: AdminOrderSize | null
  /** Kept as text so the field can be cleared while it is being typed. */
  quantity: string
}

export type ManualOrderDraft = {
  customerName: string
  customerPhone: string
  /** Channel slug, e.g. `messenger`. Empty until one is chosen. */
  channel: string
  note: string
  lines: ManualOrderLine[]
}

/** Matches the API's per-line cap. */
export const MAX_LINE_QUANTITY = 99

let nextLineKey = 0

/** A blank line with a fresh key, so two new rows never collide. */
export function emptyLine(): ManualOrderLine {
  nextLineKey += 1

  return {
    key: `line-${nextLineKey}`,
    productId: "",
    size: null,
    quantity: "1",
  }
}

export function emptyManualOrderDraft(): ManualOrderDraft {
  return {
    customerName: "",
    customerPhone: "",
    channel: "",
    note: "",
    lines: [emptyLine()],
  }
}

/** The size a freshly picked product starts on: its first, or none. */
export function defaultSize(
  product: AdminProductSummary
): AdminOrderSize | null {
  return product.sizes[0] ?? null
}

/** `"3"` → 3. Anything that is not a whole 1–99 count → `null`. */
export function parseQuantity(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null

  const quantity = Number(trimmed)
  return quantity >= 1 && quantity <= MAX_LINE_QUANTITY ? quantity : null
}

/**
 * Preview total from the catalogue. Incomplete lines contribute nothing, so the
 * figure keeps up as the draft is filled in rather than waiting for validity.
 */
export function manualOrderTotal(
  draft: ManualOrderDraft,
  products: readonly AdminProductSummary[]
): number {
  const prices = new Map(
    products.map((product) => [product.id, product.priceMmk])
  )

  return draft.lines.reduce((sum, line) => {
    const price = prices.get(line.productId)
    const quantity = parseQuantity(line.quantity)

    if (price === undefined || quantity === null) return sum
    return sum + price * quantity
  }, 0)
}

export type ManualOrderProblemField =
  "customerName" | "customerPhone" | "channel" | "lines"

export type ManualOrderProblem = {
  field: ManualOrderProblemField
  message: string
}

/**
 * The first thing that blocks submit, or `undefined` when the draft is ready.
 *
 * The catalogue is passed in so a product that was hidden while the dialog was
 * open is caught here rather than as a `400` from the API.
 */
export function manualOrderProblem(
  draft: ManualOrderDraft,
  products: readonly AdminProductSummary[]
): ManualOrderProblem | undefined {
  if (draft.customerName.trim().length === 0) {
    return {
      field: "customerName",
      message: "Customer name is required • အမည် ထည့်ပါ။",
    }
  }

  if (draft.customerPhone.trim().length < 5) {
    return {
      field: "customerPhone",
      message: "Enter the customer's phone number • ဖုန်းနံပါတ် ထည့်ပါ။",
    }
  }

  if (draft.channel.trim().length === 0) {
    return {
      field: "channel",
      message: "Choose the channel the order came from • ချန်နယ် ရွေးပါ။",
    }
  }

  const byId = new Map(products.map((product) => [product.id, product]))

  for (const line of draft.lines) {
    const product = byId.get(line.productId)

    if (!product) {
      return {
        field: "lines",
        message: "Choose a product on every line • ထုတ်ကုန် ရွေးပါ။",
      }
    }

    if (product.sizes.length > 0 && line.size === null) {
      return {
        field: "lines",
        message: `Choose a size for ${product.nameEn} • အရွယ်အစား ရွေးပါ။`,
      }
    }

    if (parseQuantity(line.quantity) === null) {
      return {
        field: "lines",
        message: `Enter a quantity from 1 to ${MAX_LINE_QUANTITY} • အရေအတွက် စစ်ပါ။`,
      }
    }
  }

  return undefined
}

/** The request body for a draft that passed `manualOrderProblem`. */
export function toCreateOrderBody(draft: ManualOrderDraft): CreateOrderBody {
  const note = draft.note.trim()

  return {
    customerName: draft.customerName.trim(),
    customerPhone: draft.customerPhone.trim(),
    channel: draft.channel,
    ...(note ? { note } : {}),
    items: draft.lines.map((line) => ({
      productId: line.productId,
      quantity: parseQuantity(line.quantity) ?? 1,
      ...(line.size ? { size: line.size } : {}),
    })),
  }
}
