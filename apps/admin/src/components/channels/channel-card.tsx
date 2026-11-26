import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"
import {
  Check,
  Copy,
  ExternalLink,
  Info,
  Link as LinkIcon,
  MessageCircle,
  Phone,
  Send,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import {
  channelHint,
  channelLinkError,
  channelMeta,
  type OrderChannel,
} from "@/lib/channels"

const CHANNEL_ICON: Record<OrderChannel["key"], LucideIcon> = {
  messenger: MessageCircle,
  viber: Phone,
  telegram: Send,
}

type ChannelCardProps = {
  channel: OrderChannel
  onChangeLink: (link: string) => void
  onToggle: (enabled: boolean) => void
}

/**
 * One channel: icon, the on/off switch, the editable public link, and the two
 * actions that go with it.
 *
 * The link is a real input — this screen is where the shop's public links are
 * kept — and the field reports its own validity, so an owner can see why a link
 * will not work before trying it. The card takes the accent border while the
 * link is invalid, matching the design's warning treatment.
 */
export function ChannelCard({
  channel,
  onChangeLink,
  onToggle,
}: ChannelCardProps) {
  const Icon = CHANNEL_ICON[channel.key]
  const error = channelLinkError(channel)
  const hint = channelHint(channel)
  const inputId = `channel-link-${channel.key}`
  const noteId = `${inputId}-note`

  const [copied, setCopied] = useState(false)

  // "Copied" is a moment, not a state: fall back to "Copy" on its own.
  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(channel.link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  // A disabled channel and an invalid link both mean the link cannot be tested.
  const cannotTest = !channel.isEnabled || error !== undefined

  return (
    <section
      className={cn(
        "flex flex-col gap-3.5 rounded-lg border bg-card p-5",
        error ? "border-accent" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon className="size-[22px] text-primary" strokeWidth={2.2} />
        </span>
        <Switch
          checked={channel.isEnabled}
          onCheckedChange={onToggle}
          aria-label={`${channel.nameEn} enabled on the storefront`}
          className="h-[30px] w-[52px] shrink-0 rounded-xl border-0 p-1 [--switch-thumb-size:22px] [--switch-thumb-travel:22px]"
        />
      </div>

      <div>
        <h2 className="font-body text-base leading-[1.7] font-bold text-foreground">
          {channel.nameMy}
        </h2>
        <p className="-mt-0.5 text-xs text-muted-foreground">
          {channelMeta(channel)}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-[13px] font-bold text-foreground"
        >
          Link • URL
        </label>

        <div
          className={cn(
            "flex min-h-12 items-center gap-2 rounded-md bg-background px-3.5",
            error ? "border-2 border-accent" : "border border-border"
          )}
        >
          <LinkIcon
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={3.4}
          />
          <input
            id={inputId}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={channel.link}
            onChange={(event) => onChangeLink(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={noteId}
            className="w-full min-w-0 flex-1 truncate bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {error ? (
          <div
            id={noteId}
            className="flex gap-1.5 rounded-sm border border-accent bg-accent/15 px-3 py-2 font-body text-xs leading-[1.7] text-accent-foreground"
          >
            <TriangleExclamationPoint
              className="mt-0.5 size-3.5 shrink-0"
              strokeWidth={3.4}
            />
            <span>
              {error.my}
              <br />
              {error.en}
            </span>
          </div>
        ) : (
          <div
            id={noteId}
            className="flex gap-1.5 font-body text-xs leading-[1.7] text-muted-foreground"
          >
            <Info
              className="mt-1 size-[13px] shrink-0 text-primary"
              strokeWidth={3.7}
            />
            <span>
              {hint.my}
              <br />
              {hint.en}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          disabled={cannotTest}
          title={
            channel.isEnabled
              ? error
                ? "Fix the link first"
                : "Open this link in a new tab"
              : "Enable the channel to test its link"
          }
          onClick={() =>
            window.open(channel.link, "_blank", "noopener,noreferrer")
          }
          className={cn(
            "min-h-11 flex-1 gap-1.5 rounded-md text-sm font-bold",
            cannotTest && "bg-muted text-muted-foreground disabled:opacity-100"
          )}
        >
          <ExternalLink className="size-[15px]" strokeWidth={3.2} />
          Test link
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => void copyLink()}
          aria-live="polite"
          className="min-h-11 gap-1 rounded-md px-3 text-[13px] font-semibold"
        >
          {copied ? (
            <Check className="size-3.5" strokeWidth={3.2} />
          ) : (
            <Copy className="size-3.5" strokeWidth={3.4} />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {channel.isEnabled ? null : (
        <div className="rounded-sm bg-muted/60 px-3 py-2 font-body text-xs leading-[1.7] text-muted-foreground">
          Disabled — hidden from storefront, past orders kept.
        </div>
      )}
    </section>
  )
}
