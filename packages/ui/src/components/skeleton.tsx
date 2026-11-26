import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"

/* The registry copy of this file could not be fetched (the shadcn CLI in this
   checkout cannot reach ui.shadcn.com — same reason `dialog.tsx` is written by
   hand), so this is the base-nova equivalent: the muted block plus the sweep of
   `--animate-shimmer` declared in `globals.css`. The sweep is decorative, so it
   is hidden from assistive tech and skipped under `prefers-reduced-motion`. */
function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "motion-safe:after:absolute motion-safe:after:inset-0 motion-safe:after:animate-shimmer motion-safe:after:bg-gradient-to-r motion-safe:after:from-transparent motion-safe:after:via-card/60 motion-safe:after:to-transparent motion-safe:after:content-['']",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
