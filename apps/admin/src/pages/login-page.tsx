import { Button } from "@workspace/ui/components/button"
import {
  ArrowRight,
  CircleExclamationPoint,
  CloudOff,
  Info,
  KeyRound,
  LoaderCircle,
  Store,
  Timer,
} from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { AuthShell } from "@/components/auth-shell"
import { CheckboxField, PasswordField, TextField } from "@/components/field"
import { useSession } from "@/auth/session-context"
import { ApiError } from "@/lib/api"
import { MESSENGER_URL } from "@/lib/contact"
import { DEMO_ACCOUNT } from "@/lib/demo-account"
import { forgetPassword, rememberPassword } from "@/lib/pending-password"
import { ROUTES } from "@/lib/routes"

const MIN_PASSWORD_LENGTH = 8

type Failure =
  | { kind: "credentials"; attemptsLeft: number }
  | { kind: "locked"; seconds: number }
  | { kind: "network" }
  | { kind: "unknown"; message: string }

function toFailure(error: unknown): Failure {
  if (error instanceof ApiError) {
    if (error.code === "ACCOUNT_LOCKED") {
      return {
        kind: "locked",
        seconds: Math.max(1, error.retryAfterSeconds ?? 60),
      }
    }

    if (error.code === "INVALID_CREDENTIALS") {
      return {
        kind: "credentials",
        attemptsLeft: Math.max(0, error.attemptsLeft ?? 0),
      }
    }

    if (error.code === "NETWORK") {
      return { kind: "network" }
    }

    return { kind: "unknown", message: error.message }
  }

  return { kind: "unknown", message: "Something went wrong. Please try again." }
}

function toClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function attemptsLabel(attemptsLeft: number) {
  if (attemptsLeft <= 0) return "no attempts left"
  return attemptsLeft === 1 ? "1 attempt left" : `${attemptsLeft} attempts left`
}

function FailureBanner({
  failure,
  remaining,
  total,
  onRetry,
}: {
  failure: Failure
  remaining: number
  total: number
  onRetry: () => void
}) {
  if (failure.kind === "credentials") {
    return (
      <div className="flex items-start gap-2.5 rounded-md border border-accent bg-secondary/50 px-3.5 py-3">
        <CircleExclamationPoint
          className="mt-0.5 size-[17px] shrink-0 text-accent-foreground"
          strokeWidth={2.8}
        />
        <div>
          <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
            အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါတယ်
          </p>
          <p className="text-xs text-muted-foreground">
            Email or password is incorrect •{" "}
            {attemptsLabel(failure.attemptsLeft)}
          </p>
        </div>
      </div>
    )
  }

  if (failure.kind === "locked") {
    const percent = total > 0 ? Math.min(100, (remaining / total) * 100) : 0

    return (
      <div className="flex items-start gap-3 rounded-md border-2 border-dashed border-border px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Timer className="size-[19px] text-primary" strokeWidth={2.5} />
        </span>
        <div className="flex-1">
          <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
            အကြိမ်များလွန်းနေပါတယ် • Too many attempts
          </p>
          <p className="text-xs text-muted-foreground">
            Please wait and try again • {toClock(remaining)} remaining
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-muted">
            <div
              className="h-full rounded-sm bg-accent transition-[width] duration-1000 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (failure.kind === "network") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-border bg-background px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <CloudOff
            className="size-[19px] text-muted-foreground"
            strokeWidth={2.5}
          />
        </span>
        <div className="flex-1">
          <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
            ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ
          </p>
          <p className="text-xs text-muted-foreground">
            Server error • Check your connection, then retry
          </p>
          <div className="flex gap-2 pt-2.5">
            <Button
              type="button"
              onClick={onRetry}
              className="min-h-11 gap-1.5 px-5 text-sm font-bold"
            >
              Retry
            </Button>
            <a
              href={MESSENGER_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground"
            >
              Contact owner
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-background px-4 py-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Info className="size-[19px] text-muted-foreground" strokeWidth={2.5} />
      </span>
      <div className="flex-1">
        <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
          ဝင်ရောက်၍ မရပါ
        </p>
        <p className="text-xs text-muted-foreground">{failure.message}</p>
      </div>
    </div>
  )
}

/**
 * The shared demo account from the design's review notes: the credentials are
 * on screen, and one tap signs in through this same form so the reviewer gets
 * the real STAFF experience, rate limits and error banners included.
 */
function DemoAccountCard({
  busy,
  disabled,
  onUse,
}: {
  busy: boolean
  disabled: boolean
  onUse: () => void
}) {
  if (!DEMO_ACCOUNT) return null

  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-border bg-secondary/40 px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <KeyRound
          className="mt-0.5 size-4 shrink-0 text-primary"
          strokeWidth={3}
        />
        <div className="min-w-0">
          <p className="font-body text-xs leading-[1.7] font-bold text-foreground">
            ဒီမိုအကောင့် • Demo account
          </p>
          <p className="text-xs break-all text-muted-foreground">
            {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
          </p>
          <p className="text-xs text-muted-foreground">
            Sample data only • For portfolio review
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onUse}
        disabled={disabled}
        className="min-h-11 w-full rounded-md text-sm font-semibold"
      >
        {busy ? (
          <>
            <LoaderCircle className="size-[15px] animate-spin" />
            ဝင်ရန် • Signing in
          </>
        ) : (
          "ဒီမိုအကောင့်ဖြင့် ဝင်ရန် • Demo sign in"
        )}
      </Button>
    </div>
  )
}

export function LoginPage() {
  const { signIn } = useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberDevice, setRememberDevice] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()

  // Lockout countdown. `total` only exists to scale the progress bar.
  const [lockRemaining, setLockRemaining] = useState(0)
  const [lockTotal, setLockTotal] = useState(0)

  const locked = failure?.kind === "locked" && lockRemaining > 0

  // A finished countdown must not leave a stale "00:00" banner on screen.
  const banner =
    failure && (failure.kind !== "locked" || lockRemaining > 0) ? failure : null

  useEffect(() => {
    if (lockRemaining <= 0) return

    const timer = window.setTimeout(
      () => setLockRemaining((seconds) => Math.max(seconds - 1, 0)),
      1000
    )

    return () => window.clearTimeout(timer)
  }, [lockRemaining])

  const submit = async (credentials?: { email: string; password: string }) => {
    if (submitting || locked) return

    const trimmedEmail = (credentials?.email ?? email).trim()
    const candidatePassword = credentials?.password ?? password
    const nextEmailError = !trimmedEmail
      ? "အီးမေးလ် ဖြည့်ရန် လိုအပ်ပါတယ် • Enter your email"
      : !trimmedEmail.includes("@")
        ? "အီးမေးလ် ပုံစံ မမှန်ပါ • Enter a valid email address"
        : undefined
    const nextPasswordError =
      candidatePassword.length < MIN_PASSWORD_LENGTH
        ? "စကားဝှက် ဖြည့်ရန် လိုအပ်ပါတယ် • Min 8 characters"
        : undefined

    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) return

    setSubmitting(true)
    setFailure(null)

    try {
      const user = await signIn({
        email: trimmedEmail,
        password: candidatePassword,
        rememberDevice,
      })

      // The reset screen has no current-password field, so the password just
      // used is kept in memory for it — and only when a reset is actually due.
      if (user.mustChangePassword) {
        rememberPassword(candidatePassword)
      }
    } catch (error) {
      forgetPassword()

      const nextFailure = toFailure(error)
      setFailure(nextFailure)

      if (nextFailure.kind === "locked") {
        setLockRemaining(nextFailure.seconds)
        setLockTotal(nextFailure.seconds)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  const signInAsDemo = () => {
    if (!DEMO_ACCOUNT) return
    void submit(DEMO_ACCOUNT)
  }

  return (
    <AuthShell>
      <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary">
            <Store
              className="size-[26px] text-primary-foreground"
              strokeWidth={2.2}
            />
          </span>
          <h1 className="font-body text-2xl leading-[1.7] font-bold text-foreground">
            အကောင့်ဝင်ရန်
          </h1>
          <p className="-mt-1 text-base text-foreground">Admin sign in</p>
          <p className="font-body text-sm leading-[1.7] text-muted-foreground">
            မှာယူမှုနှင့် ထုတ်ကုန်များ စီမံရန် ဆိုင်ဝန်ထမ်းများအတွက်
          </p>
        </div>

        {banner ? (
          <FailureBanner
            failure={banner}
            remaining={lockRemaining}
            total={lockTotal}
            onRetry={() => void submit()}
          />
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <TextField
            id="login-email"
            label="အီးမေးလ်"
            labelEn="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="username"
            placeholder="staff@yinphone.shop"
            hint="ဥပမာ — staff@yinphone.shop"
            error={emailError}
            disabled={submitting}
          />

          <PasswordField
            id="login-password"
            label="စကားဝှက်"
            labelEn="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            hint="အနည်းဆုံး ၈ လုံး • Min 8 characters"
            error={passwordError}
            disabled={submitting}
          />

          <CheckboxField
            checked={rememberDevice}
            onChange={setRememberDevice}
            label="ဒီစက်ကို မှတ်ထားရန်"
            labelEn="Remember this device"
            disabled={submitting}
          />

          <Button
            type="submit"
            disabled={submitting || locked}
            className="min-h-[52px] w-full rounded-md text-[15px] font-bold"
          >
            {submitting ? (
              <>
                <LoaderCircle className="size-[17px] animate-spin" />
                ဝင်ရန် • Signing in
              </>
            ) : (
              <>
                ဝင်ရန် • Sign in
                <ArrowRight className="size-[17px]" strokeWidth={2.8} />
              </>
            )}
          </Button>
        </form>

        <Link
          to={ROUTES.forgotPassword}
          className="-mt-2 flex min-h-11 items-center justify-center font-body text-sm font-semibold text-primary"
        >
          <span className="underline underline-offset-4">
            စကားဝှက်မေ့နေပါသလား?
          </span>
        </Link>

        <div className="flex items-start gap-2.5 rounded-md border border-border bg-background px-3.5 py-3">
          <Info
            className="mt-0.5 size-4 shrink-0 text-primary"
            strokeWidth={3}
          />
          <p className="font-body text-xs leading-[1.7] text-muted-foreground">
            စကားဝှက် ပြန်သတ်မှတ်ရန် အီးမေးလ်ဖြင့် ကုဒ် ပို့ပေးပါမည်။
            <br />
            Reset codes are emailed. No access to the account inbox? Contact the
            shop owner.
          </p>
        </div>

        <DemoAccountCard
          busy={submitting}
          disabled={submitting || locked}
          onUse={signInAsDemo}
        />
      </div>
    </AuthShell>
  )
}
