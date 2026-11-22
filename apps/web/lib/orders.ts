/**
 * Local order store.
 *
 * The storefront is chat-first: the customer copies a complete order message
 * and sends it to the shop. Orders are also kept on the device so the flow has
 * a durable result until `apps/api` owns them — swap these two functions for
 * API calls when the backend is ready.
 */

export type OrderStatus = "NEW"

export type LocalOrderItem = {
  productId: string
  title: string
  subtitle: string
  qty: number
  unitPrice: number
  size?: string
  colorName?: string
}

export type LocalOrder = {
  code: string
  createdAt: string
  status: OrderStatus
  channel: string
  customerName?: string
  customerPhone?: string
  items: LocalOrderItem[]
  total: number
}

export type NewOrderInput = Omit<LocalOrder, "code" | "createdAt" | "status">

const STORAGE_KEY = "yinphone:orders"
const CODE_PREFIX = "YP"

function isLocalOrder(value: unknown): value is LocalOrder {
  if (typeof value !== "object" || value === null) return false

  const order = value as Partial<LocalOrder>

  return typeof order.code === "string" && Array.isArray(order.items)
}

export function readOrders(): LocalOrder[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isLocalOrder)
  } catch {
    return []
  }
}

function writeOrders(orders: LocalOrder[]) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // Storage can be full or blocked; the chat message is the real order.
  }
}

function formatCode(sequence: number) {
  const year = new Date().getFullYear()

  return `${CODE_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`
}

function nextAvailableCode(orders: LocalOrder[], preferred?: string) {
  const used = new Set(orders.map((order) => order.code))

  if (preferred && !used.has(preferred)) return preferred

  let sequence = orders.length + 1
  while (used.has(formatCode(sequence))) sequence += 1

  return formatCode(sequence)
}

/** The code the next order will receive, so it can appear in the chat text. */
export function peekNextOrderCode() {
  return formatCode(readOrders().length + 1)
}

export function createOrder(input: NewOrderInput, code?: string) {
  const orders = readOrders()
  const order: LocalOrder = {
    ...input,
    code: nextAvailableCode(orders, code),
    createdAt: new Date().toISOString(),
    status: "NEW",
  }

  writeOrders([...orders, order])

  return order
}
