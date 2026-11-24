import { cn } from "@workspace/ui/lib/utils"
import { ExternalLink } from "lucide-react"

import { CHANNEL_ICONS } from "@/components/orders/channel-chip"
import {
  CHANNEL_BG,
  channelContact,
  channelName,
  type ChannelSlug,
} from "@/lib/orders"
import { formatOrderTime } from "@/lib/yangon-time"

/** Which channel the order came through, and where the thread lives. */
export function ChannelCard({
  channel,
  createdAt,
}: {
  channel: ChannelSlug
  createdAt: string
}) {
  const Icon = CHANNEL_ICONS[channel]
  const contact = channelContact(channel)

  return (
    <section className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-5">
      <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
        ချန်နယ်{" "}
        <span className="font-normal text-muted-foreground">• Channel</span>
      </h2>

      <div className="flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm text-primary-foreground",
            CHANNEL_BG[channel]
          )}
        >
          <Icon className="size-[17px]" strokeWidth={2.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-foreground">
            {channelName(channel)}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {contact.handle} • {formatOrderTime(createdAt)}
          </div>
        </div>
        <a
          href={contact.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${channelName(channel)}`}
          className="rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ExternalLink className="size-[15px]" strokeWidth={3.2} />
        </a>
      </div>
    </section>
  )
}
