import { Button } from "@workspace/ui/components/button"
import { Calendar, Download } from "lucide-react"

import type { YangonNow } from "@/lib/yangon-time"

type GreetingCardProps = {
  name: string
  now: YangonNow
}

/**
 * The greeting banner: who is signed in and when, with the mock's shortcut
 * buttons on the right. Export and the date filter stay visible but inert until
 * the orders screens exist, so they carry the same "Coming soon" affordance as
 * the unbuilt sidebar entries.
 */
export function GreetingCard({ name, now }: GreetingCardProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-body text-lg leading-[1.7] font-bold text-foreground">
          မင်္ဂလာပါ၊ {name} {now.emoji}
        </h2>
        <p className="text-sm text-muted-foreground">
          {now.greeting}, {name} • {now.longDate} • {now.time} (Asia/Yangon)
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          disabled
          title="Coming soon"
          className="min-h-11 gap-1.5 px-4 text-sm font-semibold"
        >
          <Download className="size-[15px]" strokeWidth={3.2} />
          Export
        </Button>
        <Button
          variant="outline"
          disabled
          title="Coming soon"
          className="min-h-11 gap-1.5 px-4 text-sm font-semibold"
        >
          <Calendar className="size-[15px]" strokeWidth={3.2} />
          Today
        </Button>
      </div>
    </section>
  )
}
