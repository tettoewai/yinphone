import { cn } from "@workspace/ui/lib/utils"

import { formatMmk, formatMmkCompact } from "@/lib/format"
import { SALES_AXIS_MMK, SALES_LAST_7_DAYS } from "@/lib/dashboard-mock"

/**
 * Seven-day sales column chart. Bars are plain divs rather than a charting
 * library: the design only needs single-series columns, and the numbers are
 * printed above each bar, so the native `title` covers "hover for value".
 */
export function SalesChart() {
  const total = SALES_LAST_7_DAYS.reduce((sum, day) => sum + day.amountMmk, 0)
  // The mock accents the best day of the week rather than the newest one.
  const peakMmk = Math.max(...SALES_LAST_7_DAYS.map((day) => day.amountMmk))

  return (
    <section className="rounded-lg border border-border bg-card p-5 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-2 pb-1">
        <div>
          <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
            နောက်ဆုံး ၇ ရက် ရောင်းအား
          </h2>
          <p className="text-xs text-muted-foreground">
            Sales last 7 days • MMK • hover for value
          </p>
        </div>
        <span className="rounded-sm bg-secondary px-2.5 py-1 text-xs font-bold text-primary tabular-nums">
          Total {formatMmkCompact(total)} Ks
        </span>
      </div>

      <ul
        aria-label="Sales for the last 7 days"
        className="flex h-40 items-end gap-2.5 pt-3"
      >
        {SALES_LAST_7_DAYS.map((day) => {
          const isPeak = day.amountMmk === peakMmk
          // Clamped so a value above the axis can never overflow the card.
          const heightPct = Math.min(
            100,
            Math.round((day.amountMmk / SALES_AXIS_MMK) * 100)
          )

          return (
            <li
              key={day.day}
              className="flex h-full flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[11px] font-bold text-foreground tabular-nums">
                {formatMmkCompact(day.amountMmk)}
              </span>
              {/* The track reserves the height the bar percentages are relative
                  to, so tall bars never get flattened to fit their labels. */}
              <div className="flex w-full flex-1 items-end">
                <div
                  role="img"
                  aria-label={`${day.day}: ${formatMmk(day.amountMmk)}`}
                  title={formatMmk(day.amountMmk)}
                  style={{ height: `${heightPct}%` }}
                  className={cn(
                    "w-full rounded-sm",
                    isPeak ? "bg-accent" : "bg-primary"
                  )}
                />
              </div>
              <span className="font-body text-[11px] text-muted-foreground">
                {day.day}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
