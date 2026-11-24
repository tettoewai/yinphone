import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Copy, Ellipsis, Eye, Phone } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import type { OrderSummary } from "@/lib/orders"
import { orderDetailPath } from "@/lib/routes"

/**
 * The row's overflow menu: open the detail screen, dial the customer or copy
 * the code. Only the detail link navigates; the other two act on the row in
 * place. The copy confirmation is a visually hidden live region rather than a
 * toast, because the menu closes on click and anything inside it would never be
 * seen.
 */
export function OrderRowActions({ order }: { order: OrderSummary }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(order.code)
      setCopied(true)
    } catch {
      // Clipboard writes need a secure context with permission; there is no
      // useful fallback for a read-only code, so the menu simply stays silent.
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${order.code}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-foreground transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Ellipsis className="size-[17px]" strokeWidth={2.8} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuItem
            label={`View ${order.code}`}
            render={<Link to={orderDetailPath(order.code)} />}
          >
            <Eye />
            View detail
          </DropdownMenuItem>
          <DropdownMenuItem
            label={`Call ${order.customerPhone}`}
            render={
              <a href={`tel:${order.customerPhone.replace(/\s+/g, "")}`} />
            }
          >
            <Phone />
            Call {order.customerPhone}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            label={`Copy code ${order.code}`}
            onClick={() => void copyCode()}
          >
            <Copy />
            Copy code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${order.code} copied` : ""}
      </span>
    </>
  )
}
