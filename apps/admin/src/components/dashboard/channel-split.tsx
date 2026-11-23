import { cn } from "@workspace/ui/lib/utils"

import {
  CHANNEL_SHARES,
  type ChannelShare,
  type ChannelSlug,
} from "@/lib/dashboard-mock"

/**
 * Radius chosen so the circumference is 100 in the viewBox, which lets the
 * shares double as `stroke-dasharray` lengths.
 */
const RADIUS = 15.9155
const STROKE_WIDTH = 7

const SEGMENT_STROKE: Record<ChannelSlug, string> = {
  messenger: "text-messenger",
  viber: "text-viber",
  telegram: "text-telegram",
}

const SEGMENT_SWATCH: Record<ChannelSlug, string> = {
  messenger: "bg-messenger",
  viber: "bg-viber",
  telegram: "bg-telegram",
}

/**
 * A dash offset of 25 puts the first arc at 12 o'clock; every later arc starts
 * where the ones before it ended, so the shares stack clockwise from the top.
 */
const SEGMENTS = CHANNEL_SHARES.map((channel, index) => ({
  channel,
  dashOffset:
    25 -
    CHANNEL_SHARES.slice(0, index).reduce(
      (sum, previous) => sum + previous.sharePct,
      0
    ),
}))

/**
 * Which chat channel the week's orders came through. The mock draws the ring
 * with stacked CSS borders (two colours only); an SVG donut renders all three
 * shares without that limitation and keeps the ring round.
 */
export function ChannelSplit() {
  const total = CHANNEL_SHARES.reduce((sum, channel) => sum + channel.orders, 0)

  function labelFor(channel: ChannelShare) {
    return `${channel.name} ${channel.orders} orders`
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
      <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
        ချန်နယ်အလိုက် မှာယူမှုများ
      </h2>
      <p className="pb-3 text-xs text-muted-foreground">
        Orders by channel • this week
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex size-[120px] shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 42 42"
            className="size-full"
            role="img"
            aria-label={`Orders by channel this week: ${CHANNEL_SHARES.map(labelFor).join(", ")}`}
          >
            {SEGMENTS.map(({ channel, dashOffset }) => (
              <circle
                key={channel.slug}
                cx="21"
                cy="21"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${channel.sharePct} ${100 - channel.sharePct}`}
                strokeDashoffset={dashOffset}
                className={SEGMENT_STROKE[channel.slug]}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-foreground tabular-nums">
              {total}
            </div>
            <div className="text-[11px] text-muted-foreground">orders</div>
          </div>
        </div>

        <ul className="flex min-w-[140px] flex-1 flex-col gap-2.5">
          {CHANNEL_SHARES.map((channel) => (
            <li key={channel.slug} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "inline-block size-3 shrink-0 rounded-sm",
                  SEGMENT_SWATCH[channel.slug]
                )}
              />
              <span className="flex-1 font-semibold text-foreground">
                {channel.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {channel.orders} • {channel.sharePct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
