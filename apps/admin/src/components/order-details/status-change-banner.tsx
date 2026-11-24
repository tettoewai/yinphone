import { Check } from "lucide-react"
import { useEffect, useState } from "react"

import type { OrderStatus } from "@/lib/orders"

type StatusChangeBannerProps = {
  status: OrderStatus
  /** Seconds the Undo action stays live, from `UNDO_SECONDS`. */
  seconds: number
  onUndo: () => void
  /** Called once the countdown runs out. */
  onDismiss: () => void
}

/**
 * The confirmation strip from the design, with its ten-second Undo.
 *
 * The countdown lives here rather than in the page so a change only has to
 * remount the banner (via `key`) to restart it. Every action that changes the
 * status — the primary button and the cancel dialog — ends up here, so the
 * copy and the undo window cannot drift apart.
 */
export function StatusChangeBanner({
  status,
  seconds,
  onUndo,
  onDismiss,
}: StatusChangeBannerProps) {
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
        <span className="font-bold">Status updated → {status}.</span>{" "}
        <span>လုပ်ဆောင်ချက် မှတ်တမ်းတွင် ထည့်ပြီးပါပြီ။</span>
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="shrink-0 rounded-sm px-2 py-1 text-xs font-semibold text-primary-foreground/80 underline-offset-4 outline-none hover:text-primary-foreground hover:underline focus-visible:ring-3 focus-visible:ring-primary-foreground/40"
      >
        Undo • {secondsLeft}s
      </button>
    </div>
  )
}
