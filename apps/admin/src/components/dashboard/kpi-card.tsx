import { cn } from "@workspace/ui/lib/utils"
import type { LucideIcon } from "lucide-react"

export type Kpi = {
  key: string
  icon: LucideIcon
  /** Headline figure, e.g. "14" or "684,500 Ks". */
  value: string
  label: string
  detail: string
  /** The gold "awaiting confirmation" card the mock highlights. */
  highlight?: boolean
  badge?: string
}

/**
 * One of the four figures under the greeting banner. The highlighted variant
 * carries the accent border and a caption badge (the mock's "GOLD • NEW") so it
 * reads as the card that needs attention.
 */
export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  const highlight = kpi.highlight === true

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-4",
        highlight ? "border-accent bg-accent/15" : "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            highlight
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-primary"
          )}
        >
          <Icon className="size-[19px]" strokeWidth={2.5} />
        </span>
        {kpi.badge ? (
          <span className="rounded-sm bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
            {kpi.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-1 font-heading text-2xl font-bold text-foreground tabular-nums">
        {kpi.value}
      </div>
      <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
        {kpi.label}
      </div>
      <div className="-mt-0.5 text-xs text-muted-foreground">{kpi.detail}</div>
    </div>
  )
}
