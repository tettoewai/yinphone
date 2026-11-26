import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LogIn,
  ShieldCheck,
} from "lucide-react"
import { type FormEvent, useEffect, useRef, useState } from "react"

import { useSession } from "@/auth/session-context"
import { FormAlert } from "@/components/form-alert"
import { ApiError } from "@/lib/api"
import { onSessionExpired } from "@/lib/session-expiry"

const MIN_PASSWORD_LENGTH = 8

function messageFor(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "ACCOUNT_LOCKED") {
      return `Too many attempts • try again in ${Math.max(
        1,
        error.retryAfterSeconds ?? 60
      )}s`
    }
    if (error.code === "INVALID_CREDENTIALS") {
      const left = Math.max(0, error.attemptsLeft ?? 0)
      return `Wrong password • ${left} ${left === 1 ? "attempt" : "attempts"} left`
    }
    if (error.code === "NETWORK") {
      return "Cannot reach the server • check your connection"
    }
    return error.message
  }

  return "Something went wrong. Please try again."
}

type SessionExpiredPanelProps = {
  /** Called after a successful re-authentication (used to close the dialog). */
  onRestored?: () => void
  className?: string
}

/**
 * The password prompt shown once the API rejects a request with 401.
 *
 * Re-authenticating in place — rather than bouncing through `/login` — is what
 * preserves unsaved work: the screen underneath stays mounted, so a half-typed
 * product form or settings page is still there when the dialog closes. That is
 * the design's "draft kept • nothing lost", and it is real, not a placeholder.
 */
export function SessionExpiredPanel({
  onRestored,
  className,
}: SessionExpiredPanelProps) {
  const { user, signIn, signOut } = useSession()

  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting || !user) return

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("စကားဝှက် ဖြည့်ရန် လိုအပ်ပါသည် • Enter your password")
      inputRef.current?.focus()
      return
    }

    setSubmitting(true)
    setError(undefined)

    try {
      await signIn({ email: user.email, password })
      setPassword("")
      onRestored?.()
    } catch (failure) {
      setError(messageFor(failure))
      inputRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={cn("flex w-full flex-col items-center text-center", className)}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
        <Lock className="size-[22px] text-primary" strokeWidth={2.2} />
      </span>

      <p className="pt-2 font-body text-base leading-[1.7] font-bold text-foreground">
        ဆက်ရှင် ပြီးဆုံးသွားပါပြီ
      </p>
      <p className="font-body text-[13px] leading-[1.7] text-muted-foreground">
        Your session has ended. Please sign in again. Unsaved changes stay on
        this screen.
      </p>

      {user ? (
        <p className="pt-1 text-xs text-muted-foreground">
          Signed in as{" "}
          <span className="font-semibold text-foreground">{user.email}</span>
        </p>
      ) : null}

      {error ? (
        <FormAlert
          title="ပြန်ဝင်၍ မရပါ • Could not sign back in"
          detail={error}
        />
      ) : null}

      <form onSubmit={submit} className="mt-3 flex w-full flex-col gap-2">
        <div className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-background px-3.5 focus-within:border-primary">
          <input
            ref={inputRef}
            type={visible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="password ••••••••"
            aria-label="Password"
            aria-invalid={error ? true : undefined}
            disabled={submitting}
            className="w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-pressed={visible}
            aria-label={visible ? "Hide password" : "Show password"}
            className="flex min-h-11 shrink-0 items-center text-muted-foreground"
          >
            {visible ? (
              <EyeOff className="size-4" strokeWidth={3} />
            ) : (
              <Eye className="size-4" strokeWidth={3} />
            )}
          </button>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full gap-1.5 rounded-md text-sm font-bold"
        >
          {submitting ? (
            <LoaderCircle className="size-[15px] animate-spin" />
          ) : (
            <LogIn className="size-[15px]" strokeWidth={3.2} />
          )}
          {submitting ? "Signing in…" : "Sign in again"}
        </Button>
      </form>

      <div className="flex items-center gap-1 pt-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-[13px] text-primary" strokeWidth={3.7} />
        Draft kept • nothing lost
      </div>

      <button
        type="button"
        onClick={() => void signOut()}
        disabled={submitting}
        className="mt-1 min-h-11 text-xs font-semibold text-primary underline underline-offset-4 disabled:opacity-60"
      >
        Sign out instead
      </button>
    </div>
  )
}

/**
 * App-level listener for the 401 signal from `lib/api.ts`.
 *
 * It deliberately cannot be dismissed with Escape or the backdrop: every
 * further request would fail the same way. "Sign out instead" inside the panel
 * is the escape hatch. It renders nothing while signed out — the route guards
 * already handle that case.
 */
export function SessionExpiredDialog() {
  const { user } = useSession()
  const [open, setOpen] = useState(false)

  useEffect(() => onSessionExpired(() => setOpen(true)), [])

  if (!user) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Ignore close requests from the backdrop and Escape; only the panel's
        // own actions end this state.
        if (next) setOpen(true)
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-label="Session expired"
        className="max-w-[380px]"
      >
        <SessionExpiredPanel onRestored={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
