import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Check,
  Info,
  Plus,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { ChannelCard } from "@/components/channels/channel-card"
import { StorefrontPreviewCard } from "@/components/channels/storefront-preview-card"
import {
  activeChannelCount,
  channelsFromMock,
  channelsMatch,
  enabledLinkIssues,
  type OrderChannel,
} from "@/lib/channels"
import { SHOP_URL } from "@/lib/dashboard-mock"
import { formatClockTime } from "@/lib/yangon-time"

/**
 * Order channels (`/channels`), titled "မှာယူရန် နည်းလမ်းများ" in the design.
 *
 * Local state only: there is no `GET/POST /api/channels` yet, so the cards come
 * from `CHANNELS_MOCK` and every edit — a link, a toggle — lives in this
 * component until "Save channels" is pressed. Saving snapshots the list, which
 * is what turns the banner from "live" to "saved" and what the dirty check
 * compares against.
 *
 * An enabled channel with an invalid link blocks saving: the storefront button
 * would point nowhere, so the fix belongs on this screen. Disabled channels are
 * still validated (the design surfaces Telegram's bad link while it is off) but
 * do not block, because they are not shown to shoppers.
 */
export function ChannelsPage() {
  const [channels, setChannels] = useState<OrderChannel[]>(channelsFromMock)
  const [saved, setSaved] = useState<OrderChannel[]>(channelsFromMock)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const activeCount = activeChannelCount(channels)
  const issueCount = enabledLinkIssues(channels).length
  const dirty = !channelsMatch(channels, saved)
  const blocked = issueCount > 0

  function updateChannel(
    key: OrderChannel["key"],
    patch: Partial<OrderChannel>
  ) {
    setChannels((current) =>
      current.map((channel) =>
        channel.key === key ? { ...channel, ...patch } : channel
      )
    )
  }

  function saveChannels() {
    setSaved(channels.map((channel) => ({ ...channel })))
    setLastSavedAt(new Date())
  }

  const BannerIcon: LucideIcon = blocked
    ? TriangleExclamationPoint
    : dirty
      ? Info
      : Check

  const headline = blocked
    ? "Fix before saving."
    : dirty
      ? "Unsaved changes."
      : lastSavedAt
        ? "Channels saved."
        : "Channels are live."

  const detail = blocked
    ? `${issueCount} enabled ${issueCount === 1 ? "channel has" : "channels have"} an invalid link.`
    : dirty
      ? "Save to update the storefront buttons."
      : lastSavedAt
        ? `Storefront buttons updated • ${formatClockTime(lastSavedAt)} Yangon`
        : `${activeCount} of ${channels.length} channels shown on the storefront.`

  return (
    <>
      <AdminPageHeader
        title="မှာယူရန် နည်းလမ်းများ"
        subtitle={`Order channels • ${activeCount} of ${channels.length} active`}
        actions={
          <Button
            onClick={saveChannels}
            disabled={blocked}
            title={blocked ? "Fix the highlighted link first" : undefined}
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <Plus className="size-4" strokeWidth={3} />
            Save channels
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        <div
          role="status"
          className={cn(
            "flex flex-wrap items-center gap-3 rounded-md px-4 py-3",
            blocked ? "bg-accent" : "bg-primary"
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md",
              blocked ? "bg-accent-foreground/15" : "bg-primary-foreground/15"
            )}
          >
            <BannerIcon
              className={cn(
                "size-[17px]",
                blocked ? "text-accent-foreground" : "text-primary-foreground"
              )}
              strokeWidth={2.8}
            />
          </span>
          <p
            className={cn(
              "min-w-0 flex-1 font-body text-sm leading-[1.7]",
              blocked ? "text-accent-foreground" : "text-primary-foreground"
            )}
          >
            <span className="font-bold">{headline}</span> {detail}
          </p>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "shrink-0 text-xs font-bold underline underline-offset-4",
              blocked ? "text-accent-foreground" : "text-primary-foreground"
            )}
          >
            View shop
          </a>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-3">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.key}
              channel={channel}
              onChangeLink={(link) => updateChannel(channel.key, { link })}
              onToggle={(isEnabled) =>
                updateChannel(channel.key, { isEnabled })
              }
            />
          ))}
        </div>

        <StorefrontPreviewCard channels={channels} />
      </main>
    </>
  )
}
