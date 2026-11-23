import { Button } from "@workspace/ui/components/button"
import {
  ArrowRight,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  User,
} from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link } from "react-router-dom"

import { useSession } from "@/auth/session-context"
import { AuthShell } from "@/components/auth-shell"
import { FormAlert } from "@/components/form-alert"
import { NewPasswordFields } from "@/components/new-password"
import { ApiError, authApi } from "@/lib/api"
import { forgetPassword, peekPassword } from "@/lib/pending-password"
import { isNewPasswordValid } from "@/lib/password-rules"
import { ROUTES } from "@/lib/routes"

type Failure = {
  message: string
  /** Offer a way out when retrying the form cannot help. */
  showSignIn?: boolean
}

export function ResetPasswordPage() {
  const { user, applyUser, signOut } = useSession()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<Failure>()

  // The API needs the current password to accept the change, and the only
  // copy was the one typed at sign-in. If it is gone (a reload), the form
  // cannot succeed, so offer a clean restart instead of a dead end.
  const needsReauth = Boolean(user?.mustChangePassword) && !peekPassword()

  if (needsReauth) {
    return (
      <AuthShell>
        <div className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center sm:p-8">
          <span className="flex size-14 items-center justify-center rounded-xl bg-secondary">
            <KeyRound className="size-[26px] text-primary" strokeWidth={2.2} />
          </span>
          <h1 className="font-body text-lg leading-[1.7] font-bold text-foreground">
            Sign in again to continue
          </h1>
          <p className="font-body text-sm leading-[1.7] text-muted-foreground">
            စကားဝှက် အသစ် သတ်မှတ်ရန် ပြန်လည် ဝင်ရောက်ပါ။
            <br />
            Your sign-in details are no longer available, so the password change
            has to start over.
          </p>
          <Button
            onClick={() => void signOut()}
            className="min-h-[52px] w-full rounded-md text-[15px] font-bold"
          >
            Back to sign in
            <ArrowRight className="size-[17px]" strokeWidth={2.8} />
          </Button>
        </div>
      </AuthShell>
    )
  }

  const email = user?.email ?? ""
  const canSubmit = !submitting && isNewPasswordValid(email, password, confirm)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !user) return

    const currentPassword = peekPassword()

    if (!currentPassword) {
      setFailure({
        message: "Your sign-in has expired. Please sign in again.",
        showSignIn: true,
      })
      return
    }

    setSubmitting(true)
    setFailure(undefined)

    try {
      await authApi.changePassword({ currentPassword, newPassword: password })

      forgetPassword()
      applyUser({ ...user, mustChangePassword: false })
      // RequireAuth / RequirePasswordReset redirect to the dashboard once the
      // flag flips, so there is nothing to navigate to by hand.
    } catch (error) {
      setFailure({
        message:
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.",
        showSignIn:
          error instanceof ApiError &&
          error.code === "INVALID_CURRENT_PASSWORD",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <div className="flex w-full max-w-[520px] flex-col gap-5 rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-secondary">
            <KeyRound className="size-[26px] text-primary" strokeWidth={2.2} />
          </span>
          <h1 className="font-body text-xl leading-[1.7] font-bold text-foreground">
            Set a new password / စကားဝှက်အသစ် သတ်မှတ်ပါ
          </h1>
          <p className="font-body text-sm leading-[1.7] text-muted-foreground">
            For your security, please choose a new password before continuing.
            <br />
            လုံခြုံရေးအတွက် ဆက်သွားဖို့ စကားဝှက်အသစ် ရွေးပေးပါ။
          </p>
          <div className="mt-1 flex min-h-9 items-center gap-1.5 rounded-sm bg-muted px-3 text-xs font-bold text-foreground">
            <User className="size-[13px] text-primary" strokeWidth={3.7} />
            {email} • first login required
          </div>
        </div>

        {failure ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Could not update the password"
            detail={failure.message}
          >
            {failure.showSignIn ? (
              <Link
                to={ROUTES.login}
                onClick={() => forgetPassword()}
                className="mt-1 inline-block text-xs font-bold text-primary underline underline-offset-4"
              >
                Sign in again
              </Link>
            ) : null}
          </FormAlert>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <NewPasswordFields
            email={email}
            password={password}
            confirm={confirm}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
            disabled={submitting}
          />

          <Button
            type="submit"
            disabled={!canSubmit}
            className="min-h-[52px] w-full rounded-md text-[15px] font-bold"
          >
            {submitting ? (
              <>
                <LoaderCircle className="size-[17px] animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Save and continue
                <ArrowRight className="size-[17px]" strokeWidth={2.8} />
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-[13px] text-primary" strokeWidth={3.7} />
          Required step — no cancel, you can sign in right after.
        </div>
      </div>
    </AuthShell>
  )
}
