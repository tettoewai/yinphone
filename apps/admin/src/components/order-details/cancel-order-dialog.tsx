import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ChevronDown, Trash, TriangleExclamationPoint } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useState } from "react"

import {
  CANCEL_REASONS,
  cancelReasonLabel,
  type CancelReasonKey,
} from "@/lib/order-details"

type CancelOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  code: string
  onConfirm: (reason: CancelReasonKey) => void
}

/**
 * The destructive confirmation from the design.
 *
 * A reason is mandatory: cancelled orders are kept rather than deleted, so the
 * reason is the only record of why, and "Confirm cancel" stays disabled until
 * one is picked. The selection resets whenever the dialog closes, including
 * after a confirmation, so reopening never shows a stale reason.
 */
export function CancelOrderDialog({
  open,
  onOpenChange,
  code,
  onConfirm,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState<CancelReasonKey | null>(null)

  function changeOpen(next: boolean) {
    if (!next) setReason(null)
    onOpenChange(next)
  }

  function confirm() {
    if (!reason) return
    onConfirm(reason)
    changeOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-accent-foreground">
            <TriangleExclamationPoint
              className="size-[19px]"
              strokeWidth={2.5}
            />
          </span>
          <DialogHeader>
            <DialogTitle>ဤမှာယူမှုကို ပယ်ဖျက်မလား?</DialogTitle>
            <DialogDescription>
              Cancel {code}? Cancelled orders are kept, not deleted.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Cancellation reason"
            className="flex min-h-12 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3.5 text-sm transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              className={cn(
                "truncate font-body",
                reason ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {reason
                ? cancelReasonLabel(reason)
                : "အကြောင်းရင်း ရွေးပါ • e.g. Out of stock"}
            </span>
            <ChevronDown
              className="size-[15px] shrink-0 text-muted-foreground"
              strokeWidth={3.2}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={reason ?? ""}
              onValueChange={(value) => setReason(value as CancelReasonKey)}
            >
              {CANCEL_REASONS.map((option) => (
                <DropdownMenuRadioItem
                  key={option.key}
                  value={option.key}
                  label={option.label}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => changeOpen(false)}
            className="min-h-12 px-6 text-sm font-bold"
          >
            Keep order
          </Button>
          <Button
            variant="destructive"
            disabled={!reason}
            onClick={confirm}
            className="min-h-12 gap-2 px-6 text-sm font-bold"
          >
            <Trash className="size-[15px]" strokeWidth={3.2} />
            Confirm cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
