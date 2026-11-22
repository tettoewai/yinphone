"use client"

import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

import {
  OPENING_HOURS,
  formatHours,
  getStoreStatus,
} from "@/components/contact-data"
import { cn } from "@workspace/ui/lib/utils"

type StoreStatus = ReturnType<typeof getStoreStatus>

export default function ContactHours() {
  // Resolved after mount so the prerendered HTML cannot bake in a build-time day.
  const [status, setStatus] = useState<StoreStatus | null>(null)

  useEffect(() => {
    setStatus(getStoreStatus(new Date()))
  }, [])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="size-[17px] text-primary" strokeWidth={2.82} />
          <div className="text-sm font-bold text-foreground">
            ဆိုင်ဖွင့်ချိန်
          </div>
        </div>

        {status ? (
          <div className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                status.isOpen ? "bg-primary" : "bg-muted-foreground"
              )}
            />
            {status.isOpen ? "Open now" : "Closed"}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        {OPENING_HOURS.map((entry) => {
          const isToday = status?.today?.day === entry.day

          return (
            <div
              key={entry.en}
              className={cn(
                "flex min-h-[44px] items-center justify-between border-l-4 px-4 text-sm",
                isToday
                  ? "border-primary bg-secondary/60"
                  : "border-transparent"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 text-foreground",
                  isToday && "font-bold"
                )}
              >
                <span className="font-body">{entry.my}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.en}
                </span>
                {isToday ? (
                  <span className="rounded-sm border border-border bg-card px-1.5 py-0.5 text-xs font-bold text-primary">
                    Today
                  </span>
                ) : null}
              </div>
              <div
                className={cn(
                  "text-sm",
                  isToday ? "font-bold text-primary" : "text-muted-foreground"
                )}
              >
                {formatHours(entry)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
