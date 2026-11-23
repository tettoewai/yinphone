import { CircleExclamationPoint, CircleCheck } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

/**
 * One-line-per-message banner in the design's accent style. Used where the
 * caller only needs to say "this failed" or "this worked" — the login screen
 * keeps its own richer banners for lockout and network states.
 */
export function FormAlert({
  title,
  detail,
  tone = "error",
  children,
}: {
  title: string
  detail?: string
  tone?: "error" | "success"
  children?: ReactNode
}) {
  const success = tone === "success"

  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3.5 py-3",
        success
          ? "border-primary/40 bg-secondary/50"
          : "border-accent bg-secondary/50"
      )}
    >
      {success ? (
        <CircleCheck
          className="mt-0.5 size-[17px] shrink-0 text-primary"
          strokeWidth={2.8}
        />
      ) : (
        <CircleExclamationPoint
          className="mt-0.5 size-[17px] shrink-0 text-accent-foreground"
          strokeWidth={2.8}
        />
      )}
      <div>
        <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
          {title}
        </p>
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : null}
        {children}
      </div>
    </div>
  )
}
