import { cn } from "@workspace/ui/lib/utils"
import { MessageCircle, Phone, Send, type LucideIcon } from "lucide-react"

import type { OrderChannel } from "@/lib/channels"

const CHANNEL_ICON: Record<OrderChannel["key"], LucideIcon> = {
  messenger: MessageCircle,
  viber: Phone,
  telegram: Send,
}

type StorefrontPreviewCardProps = {
  channels: readonly OrderChannel[]
}

/**
 * The storefront's contact buttons as shoppers see them, built from the same
 * list the cards edit. Enabled channels render as buttons — the first takes the
 * filled primary treatment — and disabled ones stay in place, muted and marked
 * "off", because that is the one place the switch's effect is visible at a
 * glance.
 */
export function StorefrontPreviewCard({
  channels,
}: StorefrontPreviewCardProps) {
  const firstEnabled = channels.find((channel) => channel.isEnabled)

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-5 py-4">
      <div className="shrink-0 text-[11px] font-bold text-muted-foreground">
        STOREFRONT PREVIEW
      </div>

      <div className="flex flex-wrap gap-2">
        {channels.map((channel) => {
          const Icon = CHANNEL_ICON[channel.key]
          const isPrimary = channel.key === firstEnabled?.key

          return (
            <span
              key={channel.key}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-md px-4 text-sm font-bold",
                !channel.isEnabled
                  ? "bg-muted text-muted-foreground opacity-70"
                  : isPrimary
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground"
              )}
            >
              <Icon className="size-[15px]" strokeWidth={3.2} />
              {channel.nameEn}
              {channel.isEnabled ? null : " • off"}
            </span>
          )
        })}
      </div>

      <div className="ml-auto text-xs text-muted-foreground">
        Disabling hides the button but keeps history.
      </div>
    </section>
  )
}
