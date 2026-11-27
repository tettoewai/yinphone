import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Check,
  Info,
  Plus,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { FormAlert } from "@/components/form-alert"
import { ChannelCard } from "@/components/channels/channel-card"
import { StorefrontPreviewCard } from "@/components/channels/storefront-preview-card"
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useChannels } from "@/hooks/use-channels"
import { ApiError, channelsApi } from "@/lib/api"
import {
  activeChannelCount,
  channelsFromApi,
  channelsMatch,
  enabledLinkIssues,
  type OrderChannel,
} from "@/lib/channels"
import { SHOP_URL } from "@/lib/dashboard"
import { formatClockTime } from "@/lib/yangon-time"

/** The only fields the screen edits; everything else comes from the API. */
type ChannelEdit = Partial<Pick<OrderChannel, "link" | "isEnabled">>

/**
 * Order channels (`/channels`), titled "မှာယူရန် နည်းလမ်းများ" in the design.
 *
 * Rows come from `GET /api/admin/channels`. Edits — a link, a toggle — are kept
 * as an overlay on the fetched rows, so an in-flight refetch never clobbers
 * what is being typed. "Save channels" writes the changed rows with
 * `PATCH /api/admin/channels/:id` and then refetches; the banner's "saved" time
 * is the real save, not a local edit.
 *
 * An enabled channel with an invalid link blocks saving: the storefront button
 * would point nowhere, so the fix belongs on this screen. Disabled channels are
 * still validated (the design surfaces Telegram's bad link while it is off) but
 * do not block, because they are not shown to shoppers.
 */
export function ChannelsPage() {
  const { channels: rows, error, loading, refreshing, reload } = useChannels()
  const [edits, setEdits] = useState<Record<string, ChannelEdit>>({})
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const saved = useMemo(() => channelsFromApi(rows ?? []), [rows])
  const channels = useMemo(
    () => saved.map((channel) => ({ ...channel, ...edits[channel.id] })),
    [saved, edits]
  )

  const activeCount = activeChannelCount(channels)
  const issueCount = enabledLinkIssues(channels).length
  const dirty = !channelsMatch(channels, saved)
  const blocked = issueCount > 0
  const busy = saving || refreshing

  function updateChannel(id: string, patch: ChannelEdit) {
    setEdits((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
  }

  async function saveChannels() {
    if (blocked) return

    const previous = new Map(saved.map((channel) => [channel.id, channel]))
    const changed = channels.filter((channel) => {
      const before = previous.get(channel.id)
      return (
        before !== undefined &&
        (before.link !== channel.link || before.isEnabled !== channel.isEnabled)
      )
    })

    setSaving(true)
    setActionError(null)

    try {
      await Promise.all(
        changed.map((channel) =>
          channelsApi.update(channel.id, {
            url: channel.link,
            isActive: channel.isEnabled,
          })
        )
      )
      setLastSavedAt(new Date())
      // The edit overlay still holds the saved values, so the cards keep them on
      // screen until the refetch lands instead of flashing back.
      reload()
    } catch (failure) {
      setActionError(
        failure instanceof ApiError
          ? failure.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSaving(false)
    }
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
            onClick={() => void saveChannels()}
            disabled={blocked || busy}
            title={blocked ? "Fix the highlighted link first" : undefined}
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <Plus className="size-4" strokeWidth={3} />
            {busy ? "Saving…" : "Save channels"}
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        {actionError ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Action failed"
            detail={actionError}
          />
        ) : null}

        {error ? (
          <RequestError
            detail={error instanceof ApiError ? error.message : undefined}
            onRetry={reload}
          />
        ) : loading ? (
          <TableSkeleton rows={3} className="rounded-lg" />
        ) : (
          <>
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
                  blocked
                    ? "bg-accent-foreground/15"
                    : "bg-primary-foreground/15"
                )}
              >
                <BannerIcon
                  className={cn(
                    "size-[17px]",
                    blocked
                      ? "text-accent-foreground"
                      : "text-primary-foreground"
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
                  key={channel.id}
                  channel={channel}
                  onChangeLink={(link) => updateChannel(channel.id, { link })}
                  onToggle={(isEnabled) =>
                    updateChannel(channel.id, { isEnabled })
                  }
                />
              ))}
            </div>

            <StorefrontPreviewCard channels={channels} />
          </>
        )}
      </main>
    </>
  )
}
