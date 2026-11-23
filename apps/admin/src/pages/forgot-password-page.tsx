import { Button } from "@workspace/ui/components/button"
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { cn } from "@workspace/ui/lib/utils"

import { AuthShell } from "@/components/auth-shell"
import { Field, TextField } from "@/components/field"
import { FormAlert } from "@/components/form-alert"
import { NewPasswordFields } from "@/components/new-password"
import { isNewPasswordValid } from "@/lib/password-rules"
import {
  RESEND_COOLDOWN_SECONDS,
  RESET_CODE_LENGTH,
  RESET_CODE_TTL_MINUTES,
  completePasswordReset,
  isValidEmail,
  requestResetCode,
  verifyResetCode,
} from "@/lib/password-reset"
import { ROUTES } from "@/lib/routes"

type Step = "email" | "code" | "password" | "done"

const STEP_LABELS = ["Email", "Code", "Password"] as const

const HEADINGS: Record<Step, { title: string; subtitle: string }> = {
  email: {
    title: "Reset your password / စကားဝှက် ပြန်သတ်မှတ်ရန်",
    subtitle:
      "Enter the email on your admin account and we'll send a 6-digit code. ကုဒ် ပို့ပေးပါမည်။",
  },
  code: {
    title: "Check your email / အီးမေးလ် စစ်ပါ",
    subtitle: `Enter the 6-digit code we sent you. It expires in ${RESET_CODE_TTL_MINUTES} minutes.`,
  },
  password: {
    title: "Set a new password / စကားဝှက်အသစ် သတ်မှတ်ပါ",
    subtitle:
      "Choose a password you have not used on this account before. စကားဝှက်အသစ် ရွေးပေးပါ။",
  },
  done: {
    title: "Password updated / ပြောင်းပြီးပါပြီ",
    subtitle:
      "Your password has been changed. Sign in with the new one. စကားဝှက်အသစ်ဖြင့် ဝင်ပါ။",
  },
}

function stepIndex(step: Step) {
  if (step === "email") return 0
  if (step === "code") return 1
  return 2
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [ticket, setTicket] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [emailError, setEmailError] = useState<string>()
  const [codeError, setCodeError] = useState<string>()
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return

    const timer = window.setTimeout(
      () => setResendIn((seconds) => Math.max(seconds - 1, 0)),
      1000
    )

    return () => window.clearTimeout(timer)
  }, [resendIn])

  const sendCode = async (target: string) => {
    setSubmitting(true)
    setError(undefined)

    try {
      await requestResetCode(target)
      setCode("")
      setCodeError(undefined)
      setResendIn(RESEND_COOLDOWN_SECONDS)
      setStep("code")
    } catch {
      setError("Could not send the code. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmailStep = () => {
    const trimmed = email.trim().toLowerCase()
    const nextError = !trimmed
      ? "အီးမေးလ် ဖြည့်ရန် လိုအပ်ပါတယ် • Enter your email"
      : !isValidEmail(trimmed)
        ? "အီးမေးလ် ပုံစံ မမှန်ပါ • Enter a valid email address"
        : undefined

    setEmailError(nextError)
    if (nextError) return

    setEmail(trimmed)
    void sendCode(trimmed)
  }

  const handleCodeStep = async () => {
    const nextError =
      code.length === RESET_CODE_LENGTH
        ? undefined
        : `Enter all ${RESET_CODE_LENGTH} digits`

    setCodeError(nextError)
    if (nextError) return

    setSubmitting(true)
    setError(undefined)

    try {
      const result = await verifyResetCode(email, code)
      setTicket(result.ticket)
      setStep("password")
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "That code could not be verified."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordStep = async () => {
    if (!isNewPasswordValid(email, password, confirm)) return

    setSubmitting(true)
    setError(undefined)

    try {
      await completePasswordReset(ticket, password)
      setPassword("")
      setConfirm("")
      setStep("done")
    } catch {
      setError("Could not update the password. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step === "email") handleEmailStep()
    else if (step === "code") void handleCodeStep()
    else if (step === "password") void handlePasswordStep()
  }

  const heading = HEADINGS[step]
  const currentStep = stepIndex(step)
  const canSubmit =
    !submitting &&
    (step === "email"
      ? email.trim().length > 0
      : step === "code"
        ? code.length === RESET_CODE_LENGTH
        : step === "password"
          ? isNewPasswordValid(email, password, confirm)
          : true)

  return (
    <AuthShell>
      <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-xl",
              step === "password" ? "bg-secondary" : "bg-primary"
            )}
          >
            {step === "done" ? (
              <CircleCheck
                className="size-[26px] text-primary-foreground"
                strokeWidth={2.2}
              />
            ) : step === "password" ? (
              <KeyRound
                className="size-[26px] text-primary"
                strokeWidth={2.2}
              />
            ) : (
              <Mail
                className="size-[26px] text-primary-foreground"
                strokeWidth={2.2}
              />
            )}
          </span>
          <h1 className="font-body text-xl leading-[1.7] font-bold text-foreground">
            {heading.title}
          </h1>
          <p className="font-body text-sm leading-[1.7] text-muted-foreground">
            {heading.subtitle}
          </p>
        </div>

        {step !== "done" ? (
          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, index) => (
              <span
                key={label}
                className={cn(
                  "flex min-h-7 flex-1 items-center justify-center rounded-sm text-[11px] font-bold",
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        ) : null}

        {step === "code" ? (
          <div className="flex min-h-9 items-center justify-center gap-1.5 rounded-sm bg-muted px-3 text-center text-xs font-bold text-foreground">
            <Mail
              className="size-[13px] shrink-0 text-primary"
              strokeWidth={3.7}
            />
            {email}
          </div>
        ) : null}

        {error ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Something went wrong"
            detail={error}
          />
        ) : null}

        {step === "done" ? (
          <div className="flex flex-col gap-4">
            <Link
              to={ROUTES.login}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-bold text-primary-foreground"
            >
              Back to sign in
              <ArrowRight className="size-[17px]" strokeWidth={2.8} />
            </Link>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck
                className="size-[13px] text-primary"
                strokeWidth={3.7}
              />
              Every other session for this account was signed out.
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            {step === "email" ? (
              <TextField
                id="reset-email"
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
            ) : null}

            {step === "code" ? (
              <Field
                id="reset-code"
                label="ကုဒ်"
                labelEn={`${RESET_CODE_LENGTH}-digit code`}
                hint="Didn't get it? Check spam, or resend below."
                error={codeError}
              >
                <div
                  className={cn(
                    "flex min-h-14 items-center gap-2 rounded-md border-2 bg-input px-3.5 transition-colors focus-within:border-primary",
                    codeError ? "border-accent" : "border-border"
                  )}
                >
                  <input
                    id="reset-code"
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, RESET_CODE_LENGTH)
                      )
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={"0".repeat(RESET_CODE_LENGTH)}
                    aria-invalid={codeError ? true : undefined}
                    aria-describedby={
                      codeError ? "reset-code-message" : undefined
                    }
                    disabled={submitting}
                    className="w-full flex-1 bg-transparent text-center text-2xl font-bold tracking-[0.4em] text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </Field>
            ) : null}

            {step === "password" ? (
              <NewPasswordFields
                email={email}
                password={password}
                confirm={confirm}
                onPasswordChange={setPassword}
                onConfirmChange={setConfirm}
                disabled={submitting}
              />
            ) : null}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="min-h-[52px] w-full rounded-md text-[15px] font-bold"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-[17px] animate-spin" />
                  Working…
                </>
              ) : (
                <>
                  {step === "email"
                    ? "Send code"
                    : step === "code"
                      ? "Verify code"
                      : "Save new password"}
                  <ArrowRight className="size-[17px]" strokeWidth={2.8} />
                </>
              )}
            </Button>
          </form>
        )}

        {step === "code" ? (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => void sendCode(email)}
              disabled={submitting || resendIn > 0}
              className="flex min-h-11 items-center justify-center text-xs font-semibold text-primary disabled:text-muted-foreground"
            >
              {resendIn > 0
                ? `Resend code in ${String(Math.floor(resendIn / 60))}:${String(resendIn % 60).padStart(2, "0")}`
                : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email")
                setError(undefined)
                setCodeError(undefined)
              }}
              disabled={submitting}
              className="flex min-h-9 items-center gap-1.5 text-xs font-semibold text-muted-foreground"
            >
              <ArrowLeft className="size-3.5" strokeWidth={3} />
              Use a different email
            </button>
          </div>
        ) : null}
      </div>
    </AuthShell>
  )
}
