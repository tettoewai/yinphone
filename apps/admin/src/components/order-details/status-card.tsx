import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Bell, Check, Truck, X, type LucideIcon } from "lucide-react"
import { useState } from "react"

import { CancelOrderDialog } from "@/components/order-details/cancel-order-dialog"
import {
  STATUS_FLOW,
  STEP_LABELS,
  statusStep,
  type CancelReasonKey,
  type FlowStatus,
} from "@/lib/order-details"
import type { OrderStatus } from "@/lib/orders"

const STEP_ICONS: Record<FlowStatus, LucideIcon> = {
  NEW: Bell,
  CONFIRMED: Check,
  DELIVERED: Truck,
}

type StatusCardProps = {
  code: string
  status: OrderStatus
  onCancel: (reason: CancelReasonKey) => void
}

/**
 * The status stepper plus the cancel action.
 *
 * Completed steps take `primary`, the current step takes `accent` and the ones
 * still ahead stay `muted` — the same three tones the status badges use, so
 * the card reads at a glance. A cancelled order leaves the flow entirely:
 * every step goes muted and the cancel button is disabled.
 */
export function StatusCard({ code, status, onCancel }: StatusCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const step = statusStep(status)
  const cancelled = status === "CANCELLED"
  const canCancel = status === "NEW" || status === "CONFIRMED"

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
        အခြေအနေ{" "}
        <span className="font-normal text-muted-foreground">• Status</span>
      </h2>

      <div className="flex items-start">
        {STATUS_FLOW.map((flowStatus, index) => {
          const Icon = STEP_ICONS[flowStatus]
          const done = step > index
          const current = step === index

          return (
            <div key={flowStatus} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl",
                    current && "bg-accent text-accent-foreground",
                    done && "bg-primary text-primary-foreground",
                    !current && !done && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-[15px]" strokeWidth={3.2} />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold",
                    current || done
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[flowStatus]}
                </span>
              </div>
              {index < STATUS_FLOW.length - 1 ? (
                <div className="mx-1 mb-5 h-0.5 flex-1 bg-border" />
              ) : null}
            </div>
          )
        })}
      </div>

      {cancelled ? (
        <p className="rounded-sm bg-muted px-3 py-2 text-xs text-muted-foreground">
          ပယ်ဖျက်ပြီး • This order was cancelled, so the steps stay inactive.
        </p>
      ) : null}

      <Button
        variant="outline"
        disabled={!canCancel}
        onClick={() => setConfirmOpen(true)}
        className="min-h-11 w-full gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <X className="size-[15px]" strokeWidth={3.2} />
        Cancel order • ပယ်ဖျက်ရန်
      </Button>

      <CancelOrderDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        code={code}
        onConfirm={onCancel}
      />
    </section>
  )
}
