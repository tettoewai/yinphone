import { cn } from "@workspace/ui/lib/utils"

import { ORDER_STATUSES, STATUS_META, type OrderStatus } from "@/lib/orders"

type StatusFilterPillsProps = {
  value: OrderStatus | "all"
  /** Orders matching every other filter; what the counts are measured against. */
  total: number
  counts: Record<OrderStatus, number>
  onChange: (value: OrderStatus | "all") => void
}

const pillBase =
  "flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function countClass(selected: boolean) {
  return cn(
    "rounded-sm px-1.5 py-0.5 text-xs font-bold",
    selected
      ? "bg-primary-foreground/20 text-primary-foreground"
      : "bg-muted text-foreground"
  )
}

/**
 * The status row. Each pill is a toggle, not a tab: the list underneath keeps
 * its other filters, so `aria-pressed` is the honest state to expose. Counts are
 * measured before the status filter, so they do not all collapse to the
 * selected status.
 */
export function StatusFilterPills({
  value,
  total,
  counts,
  onChange,
}: StatusFilterPillsProps) {
  return (
    <div
      role="group"
      aria-label="Filter orders by status"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        aria-pressed={value === "all"}
        onClick={() => onChange("all")}
        className={cn(
          pillBase,
          value === "all"
            ? "border border-primary bg-primary text-primary-foreground"
            : "border border-border bg-card text-foreground hover:bg-muted"
        )}
      >
        <span className="font-body leading-[1.7]">အားလုံး</span>
        <span
          className={cn(
            "text-xs",
            value === "all" ? "opacity-80" : "text-muted-foreground"
          )}
        >
          All
        </span>
        <span className={countClass(value === "all")}>{total}</span>
      </button>

      {ORDER_STATUSES.map((status) => {
        const meta = STATUS_META[status]
        const selected = value === status

        return (
          <button
            key={status}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(status)}
            className={cn(
              pillBase,
              selected
                ? "border border-primary bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "inline-block size-2 rounded-xl",
                meta.dotClassName
              )}
            />
            <span className="font-body leading-[1.7]">{meta.label}</span>
            <span
              className={cn(
                "text-xs",
                selected ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {meta.labelEn}
            </span>
            <span className={countClass(selected)}>{counts[status]}</span>
          </button>
        )
      })}
    </div>
  )
}
