"use client"

import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type BottomSheetProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Mobile bottom sheet used by the menu, filters and size guide. Handles the
 * overlay, Escape key and body scroll lock so each caller only owns content.
 */
export default function BottomSheet({
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[88svh] w-full max-w-md flex-col overflow-hidden rounded-t-lg border border-border bg-card",
          className
        )}
      >
        <div className="flex justify-center pt-2 pb-1" aria-hidden="true">
          <div className="h-1 w-10 rounded-sm bg-muted" />
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2">
          <div className="min-w-0">
            <div className="font-body text-base leading-[1.7] font-bold text-foreground">
              {title}
            </div>
            {description ? (
              <div className="-mt-1 text-xs text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center"
          >
            <X className="size-5 text-muted-foreground" strokeWidth={2.4} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
      </div>
    </div>
  )
}
