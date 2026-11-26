import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Phone } from "lucide-react"

import { CHANNEL_ICONS } from "@/components/orders/channel-chip"
import { customerInitial, type OrderDetail } from "@/lib/order-details"
import {
  CHANNEL_BG,
  CHANNELS,
  channelContact,
  channelName,
  type ChannelSlug,
} from "@/lib/orders"

/** Brand-coloured glyphs for the secondary channel chips. */
const CHANNEL_TEXT: Record<ChannelSlug, string> = {
  messenger: "text-messenger",
  viber: "text-viber",
  telegram: "text-telegram",
}

/**
 * Who ordered, how to reach them, and the channels they can be reached on.
 *
 * The primary button is the channel the order came through; the other two are
 * offered as outline chips because the shop may prefer a different channel.
 * Every link opens in a new tab — leaving the admin mid-order would lose the
 * in-page status changes this session made.
 */
export function CustomerCard({ order }: { order: OrderDetail }) {
  const ChannelIcon = CHANNEL_ICONS[order.channel]
  const primaryContact = channelContact(order.channel)
  const otherChannels = CHANNELS.filter((slug) => slug !== order.channel)

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
          ဝယ်သူ{" "}
          <span className="font-normal text-muted-foreground">• Customer</span>
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {order.priorOrderCount === 1
            ? "1 order"
            : `${order.priorOrderCount} orders`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-base font-bold text-primary">
          {customerInitial(order.customerName)}
        </span>
        <div className="min-w-0">
          <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
            {order.customerName}
          </div>
        </div>
      </div>

      <a
        href={`tel:${order.customerPhone.replace(/\s+/g, "")}`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "min-h-12 w-full gap-2 text-sm font-bold"
        )}
      >
        <Phone className="size-4 text-primary" strokeWidth={3} />
        {order.customerPhone}
      </a>

      <a
        href={primaryContact.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-bold text-primary-foreground",
          CHANNEL_BG[order.channel]
        )}
      >
        <ChannelIcon className="size-4" strokeWidth={3} />
        <span className="font-body">
          {channelName(order.channel)} တွင် စကားပြောရန်
        </span>
      </a>

      <div className="flex gap-2">
        {otherChannels.map((slug) => {
          const Icon = CHANNEL_ICONS[slug]

          return (
            <a
              key={slug}
              href={channelContact(slug).url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-11 flex-1 gap-1.5 text-[13px] font-semibold"
              )}
            >
              <Icon
                className={cn("size-3.5", CHANNEL_TEXT[slug])}
                strokeWidth={3.4}
              />
              {channelName(slug)}
            </a>
          )
        })}
      </div>
    </section>
  )
}
