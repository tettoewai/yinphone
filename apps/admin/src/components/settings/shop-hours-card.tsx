import { cn } from "@workspace/ui/lib/utils"

import {
  settingsSectionId,
  shopOpenState,
  type DaySchedule,
} from "@/lib/settings"

type ShopHoursCardProps = {
  hours: readonly DaySchedule[]
}

/**
 * The opening hours, with a live "open now" chip.
 *
 * The rows are the schedule the owner will edit once the settings API exists;
 * today they come from `SHOP_HOURS_MOCK`. The chip and the preview line are
 * derived from that same schedule in Asia/Yangon, so they flip at closing time
 * instead of reproducing the design's frozen 10:42 AM.
 */
export function ShopHoursCard({ hours }: ShopHoursCardProps) {
  const state = shopOpenState(hours)

  return (
    <section
      id={settingsSectionId("hours")}
      className="scroll-mt-24 rounded-lg border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
          ဆိုင်ဖွင့်ချိန် • Hours
        </h2>
        <span className="flex min-h-9 items-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-bold text-secondary-foreground">
          <span
            className={cn(
              "inline-block size-2 rounded-xl",
              state.isOpen ? "bg-primary" : "bg-muted-foreground"
            )}
          />
          {state.chip}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 pt-3">
        {hours.map((day) => {
          const closed = day.opens === null || day.closes === null

          return (
            <div
              key={day.weekday}
              className={cn(
                "flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-md px-3",
                closed
                  ? "border border-transparent bg-muted/50"
                  : "border border-border bg-background"
              )}
            >
              <span
                className={cn(
                  "text-[13px] font-semibold",
                  closed ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {day.label}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs",
                    closed
                      ? "text-muted-foreground"
                      : "font-bold text-foreground"
                  )}
                >
                  {closed ? "Closed • ပိတ်သည်" : `${day.opens} – ${day.closes}`}
                </span>
                <span
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-[11px] font-bold",
                    closed
                      ? "border border-border bg-card text-muted-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {closed ? "Closed" : "Open"}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="pt-2 text-xs text-muted-foreground">{state.preview}</p>
    </section>
  )
}
