import { Check, Minus } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

import { PasswordField } from "@/components/field"
import { passwordRules } from "@/lib/password-rules"

/**
 * The "choose a new password" block from `design/reset-password.html`, shared
 * by the forced change screen and the email-OTP reset flow.
 */

const STRENGTH_LABELS = [
  "",
  "Weak • အားနည်း",
  "Fair • ပုံမှန်",
  "Strong • ခိုင်မာသည်",
] as const

const PILL_LABELS = ["Weak", "Fair", "Strong"] as const

type NewPasswordFieldsProps = {
  email: string
  password: string
  confirm: string
  onPasswordChange: (value: string) => void
  onConfirmChange: (value: string) => void
  disabled?: boolean
}

export function NewPasswordFields({
  email,
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  disabled,
}: NewPasswordFieldsProps) {
  const rules = passwordRules(email)
  const met = rules.filter((rule) => rule.test(password)).length
  const level = met >= 4 ? 3 : met >= 3 ? 2 : met >= 2 ? 1 : 0
  const strengthLabel =
    level === 0 ? "Too short • အတိုလွန်းသည်" : STRENGTH_LABELS[level]

  const confirmError =
    confirm.length > 0 && confirm !== password
      ? "စကားဝှက် မတူပါ • Passwords do not match"
      : undefined

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="new-password"
          label="New password"
          labelEn="စကားဝှက်အသစ်"
          value={password}
          onChange={onPasswordChange}
          autoComplete="new-password"
          disabled={disabled}
        />

        <div className="flex items-center gap-2 pt-1">
          <div className="flex h-2 flex-1 gap-1 overflow-hidden rounded-xl bg-muted">
            {[0, 1, 2].map((segment) => (
              <div
                key={segment}
                className={cn(
                  "flex-1 rounded-xl",
                  segment < level ? "bg-primary" : "bg-transparent"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-primary">
            {strengthLabel}
          </span>
        </div>

        <div className="flex gap-1.5">
          {PILL_LABELS.map((label, index) => (
            <span
              key={label}
              className={cn(
                "flex min-h-8 flex-1 items-center justify-center rounded-sm text-[11px] font-bold",
                level === index + 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <PasswordField
        id="confirm-password"
        label="Confirm new password"
        labelEn="စကားဝှက် အတည်ပြုပါ"
        value={confirm}
        onChange={onConfirmChange}
        autoComplete="new-password"
        error={confirmError}
        disabled={disabled}
      />

      <div className="flex flex-col gap-2 rounded-md border border-border bg-background px-4 py-3.5">
        <div className="text-xs font-bold text-foreground">
          Password rules • လိုအပ်ချက်များ
        </div>
        {rules.map((rule) => {
          const passed = rule.test(password)

          return (
            <div key={rule.id} className="flex items-center gap-2 text-[13px]">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-xl",
                  passed ? "bg-primary" : "bg-muted"
                )}
              >
                {passed ? (
                  <Check
                    className="size-[13px] text-primary-foreground"
                    strokeWidth={3.7}
                  />
                ) : (
                  <Minus
                    className="size-[13px] text-muted-foreground"
                    strokeWidth={3.7}
                  />
                )}
              </span>
              <span
                className={cn(
                  "font-semibold",
                  passed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}
