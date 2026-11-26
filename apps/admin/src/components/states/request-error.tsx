import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { CloudOff, LoaderCircle, MessageCircle, RotateCcw } from "lucide-react"
import type { ReactNode } from "react"

import { MESSENGER_HANDLE, MESSENGER_URL } from "@/lib/contact"

type RequestErrorProps = {
  /** Myanmar headline; the English line goes in `detail`. */
  title?: string
  detail?: string
  onRetry?: () => void
  /** Swaps the retry label for a spinner and blocks a second press. */
  retrying?: boolean
  retryLabel?: string
  /** Small caption for the states preview sheet. */
  caption?: ReactNode
  className?: string
}

/**
 * A full-request failure: the screen could not load its data.
 *
 * Retry is the primary action because a failed request is usually transient.
 * The developer link is deliberately second and talks to a person, so the
 * "urgent" line underneath says how fast that channel answers — the pattern
 * the design uses on the error state.
 */
export function RequestError({
  title = "တစ်ခုခုမှားသွားပါသည်",
  detail = "Something went wrong • the request could not complete",
  onRetry,
  retrying = false,
  retryLabel = "Try again",
  caption,
  className,
}: RequestErrorProps) {
  return (
    <section
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-lg border border-border bg-card px-6 py-8 text-center",
        className
      )}
    >
      {caption ? (
        <p className="pb-3 text-[11px] font-bold text-muted-foreground">
          {caption}
        </p>
      ) : null}
      <span className="flex size-14 items-center justify-center rounded-xl bg-muted">
        <CloudOff
          className="size-[26px] text-muted-foreground"
          strokeWidth={1.9}
        />
      </span>

      <h2 className="pt-2 font-body text-base leading-[1.7] font-bold text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{detail}</p>

      <div className="flex flex-wrap justify-center gap-2 pt-4">
        <Button
          type="button"
          onClick={onRetry}
          disabled={retrying || !onRetry}
          className="min-h-12 gap-1.5 rounded-md px-6 text-sm font-bold"
        >
          {retrying ? (
            <LoaderCircle className="size-[15px] animate-spin" />
          ) : (
            <RotateCcw className="size-[15px]" strokeWidth={3.2} />
          )}
          {retrying ? "Retrying…" : retryLabel}
        </Button>

        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-12 gap-1.5 rounded-md px-5 text-sm font-bold"
          )}
        >
          <MessageCircle
            className="size-[15px] text-primary"
            strokeWidth={3.2}
          />
          Message developer
        </a>
      </div>

      <p className="pt-2 text-xs text-muted-foreground">
        Urgent? Messenger {MESSENGER_HANDLE} → dev support replies in ~10 min.
      </p>
    </section>
  )
}
