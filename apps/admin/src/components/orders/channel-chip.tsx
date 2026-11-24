import { MessageCircle, Phone, Send, type LucideIcon } from "lucide-react"

import { channelName, type ChannelSlug } from "@/lib/orders"

/**
 * Channel glyphs from the design mock: Messenger's speech bubble, Viber's
 * handset and Telegram's paper plane. The brand colours (`--color-viber`,
 * `--color-telegram`) are deliberately not used inside the chip — the mock
 * keeps every chip on `secondary`/`primary` so the status badge stays the
 * loudest thing in the row.
 */
export const CHANNEL_ICONS: Record<ChannelSlug, LucideIcon> = {
  messenger: MessageCircle,
  viber: Phone,
  telegram: Send,
}

/** The 28px channel chip used by both the table row and the mobile card. */
export function ChannelChip({ channel }: { channel: ChannelSlug }) {
  const Icon = CHANNEL_ICONS[channel]

  return (
    <span className="flex items-center gap-1.5 text-[13px] text-foreground">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-secondary">
        <Icon className="size-3.5 text-primary" strokeWidth={3.4} />
      </span>
      {channelName(channel)}
    </span>
  )
}
