import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Calendar, ChevronDown, Filter, Search } from "lucide-react"
import type { ReactNode } from "react"

import { CHANNEL_ICONS } from "@/components/orders/channel-chip"
import {
  CHANNELS,
  DATE_RANGES,
  channelName,
  dateRangeLabel,
  type ChannelSlug,
  type DateRangeKey,
} from "@/lib/orders"

type OrderFiltersProps = {
  query: string
  onQueryChange: (value: string) => void
  channel: ChannelSlug | "all"
  onChannelChange: (value: ChannelSlug | "all") => void
  range: DateRangeKey
  onRangeChange: (value: DateRangeKey) => void
  /** The status pills, rendered between the filter row and the helper line. */
  children: ReactNode
}

/**
 * Same 48px chips as the mock. The selected chip takes a 2px primary border,
 * which is the only selected state the design shows for these two facets.
 */
function chipClass(selected: boolean) {
  return cn(
    "flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-card px-4 text-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    selected ? "border-2 border-primary" : "border border-border"
  )
}

/**
 * Search, channel and date presets. Only the presets exist — there is no custom
 * range picker, because nothing behind it could honour an arbitrary window yet.
 */
export function OrderFilters({
  query,
  onQueryChange,
  channel,
  onChannelChange,
  range,
  onRangeChange,
  children,
}: OrderFiltersProps) {
  const ChannelIcon = channel === "all" ? CHANNEL_ICONS.messenger : CHANNEL_ICONS[channel]

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex min-h-12 min-w-[220px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="ကုဒ်၊ အမည်၊ ဖုန်းဖြင့် ရှာရန်…"
            aria-label="Search orders by code, name or phone"
            className="h-12 rounded-md border-border bg-background pr-3 pl-10 text-sm dark:bg-background"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={chipClass(channel !== "all")}
            aria-label={`Channel: ${channel === "all" ? "All channels" : channelName(channel)}`}
          >
            <ChannelIcon className="size-4 shrink-0 text-primary" strokeWidth={3} />
            <span className="font-semibold text-foreground">
              {channel === "all" ? "All channels" : channelName(channel)}
            </span>
            <ChevronDown className="size-[15px] shrink-0 text-muted-foreground" strokeWidth={3.2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuRadioGroup
              value={channel}
              onValueChange={(value) =>
                onChannelChange(value as ChannelSlug | "all")
              }
            >
              <DropdownMenuRadioItem value="all" label="All channels">
                All channels
              </DropdownMenuRadioItem>
              {CHANNELS.map((slug) => {
                const Icon = CHANNEL_ICONS[slug]

                return (
                  <DropdownMenuRadioItem
                    key={slug}
                    value={slug}
                    label={channelName(slug)}
                  >
                    <Icon />
                    {channelName(slug)}
                  </DropdownMenuRadioItem>
                )
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={chipClass(range !== "all")}
            aria-label={`Date range: ${dateRangeLabel(range)}`}
          >
            <Calendar className="size-4 shrink-0 text-primary" strokeWidth={3} />
            <span className="font-semibold text-foreground">
              {dateRangeLabel(range)}
            </span>
            <ChevronDown className="size-[15px] shrink-0 text-muted-foreground" strokeWidth={3.2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuRadioGroup
              value={range}
              onValueChange={(value) => onRangeChange(value as DateRangeKey)}
            >
              {DATE_RANGES.map((option) => (
                <DropdownMenuRadioItem
                  key={option.key}
                  value={option.key}
                  label={option.label}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {children}

      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Filter className="size-[13px] shrink-0" strokeWidth={3.7} />
        <span>
          Today • Last 7 days • Last 30 days • Times shown in Asia/Yangon
        </span>
      </p>
    </section>
  )
}
