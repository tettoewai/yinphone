import { Badge } from "@workspace/ui/components/badge"

import { stockState } from "@/lib/products"

/** Same colour language as the status badges: beige, gold, then grey. */
const VARIANT = {
  in: "secondary",
  low: "new",
  out: "cancelled",
} as const

/**
 * The stock cell: the count on a tinted chip, or `0 • Out` so an empty product
 * cannot be mistaken for a low one. Sizes are reset from the badge's compact
 * default because the design wants a larger chip than a status pill.
 */
export function StockBadge({ stock }: { stock: number }) {
  const state = stockState(stock)

  return (
    <Badge
      variant={VARIANT[state]}
      className="h-auto rounded-sm px-2.5 py-1 text-sm font-bold"
    >
      {state === "out" ? `${stock} • Out` : stock}
    </Badge>
  )
}
