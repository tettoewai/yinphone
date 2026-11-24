import { Check } from "lucide-react"
import { useEffect, useState } from "react"

import type { ProductChange } from "@/lib/products"

const COPY: Record<ProductChange["kind"], { verb: string; detail: string }> = {
  hidden: {
    verb: "hidden",
    detail: "Staff and shoppers no longer see it.",
  },
  duplicated: {
    verb: "duplicated",
    detail:
      "Saved as a hidden draft — filter SHOWING → Hidden to edit it before publishing.",
  },
}

type ProductsChangeBannerProps = {
  change: ProductChange
  /** Seconds the Undo action stays live, from `UNDO_SECONDS`. */
  seconds: number
  onUndo: () => void
  /** Called once the countdown runs out. */
  onDismiss: () => void
}

/**
 * The confirmation strip from the design, with its ten-second Undo.
 *
 * Hiding and duplicating both land here, so the copy and the undo window cannot
 * drift apart. The countdown lives in the component; the page remounts it with
 * a `key` per change to restart it.
 */
export function ProductsChangeBanner({
  change,
  seconds,
  onUndo,
  onDismiss,
}: ProductsChangeBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(seconds)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = window.setTimeout(
      () => setSecondsLeft((left) => left - 1),
      1000
    )
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  // Deferred by a tick: dismissing unmounts this component, so it must not
  // happen in the same commit as the last decrement.
  useEffect(() => {
    if (secondsLeft > 0) return

    const timer = window.setTimeout(onDismiss, 0)
    return () => window.clearTimeout(timer)
  }, [secondsLeft, onDismiss])

  const copy = COPY[change.kind]

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-md bg-primary px-4 py-3"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-foreground/15">
        <Check
          className="size-[17px] text-primary-foreground"
          strokeWidth={2.8}
        />
      </span>

      <div className="min-w-0 flex-1 font-body text-sm leading-[1.7] text-primary-foreground">
        <span className="font-bold">
          “{change.name}” {copy.verb}.
        </span>{" "}
        <span>{copy.detail}</span>
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="shrink-0 rounded-sm px-2 py-1 text-xs font-bold text-primary-foreground underline underline-offset-4 outline-none hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-primary-foreground/40"
      >
        Undo • {secondsLeft}s
      </button>
    </div>
  )
}
