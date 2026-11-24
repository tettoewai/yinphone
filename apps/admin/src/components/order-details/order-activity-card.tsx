import { cn } from "@workspace/ui/lib/utils"

import { ACTIVITY_DOT, type ActivityEntry } from "@/lib/order-details"
import { formatOrderTimestamp } from "@/lib/yangon-time"

/**
 * Everything that happened to the order, oldest first. Locally applied changes
 * (a status click, a cancellation) are appended to the same list, so the log
 * stays a truthful record of what this session did.
 */
export function OrderActivityCard({
  entries,
}: {
  entries: readonly ActivityEntry[]
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <h2 className="border-b border-border px-5 py-3.5 font-body text-sm leading-[1.7] font-bold text-foreground">
        လုပ်ဆောင်ချက် မှတ်တမ်း{" "}
        <span className="font-normal text-muted-foreground">
          • Activity log
        </span>
      </h2>

      <ol className="list-none">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className={cn(
              "flex gap-3 px-5 py-3",
              index < entries.length - 1 && "border-b border-border"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-2.5 shrink-0 rounded-xl",
                ACTIVITY_DOT[entry.tone]
              )}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {entry.title}
              </div>
              <div className="font-body text-[13px] leading-[1.7] text-muted-foreground">
                {entry.detail}
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.actor} •{" "}
                <time dateTime={entry.at}>
                  {formatOrderTimestamp(entry.at)}
                </time>{" "}
                • Asia/Yangon
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
