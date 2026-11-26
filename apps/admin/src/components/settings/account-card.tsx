import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Circle, CircleCheck, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { FormAlert } from "@/components/form-alert"
import {
  accountPasswordRules,
  emptyPasswordDraft,
  passwordFormError,
  settingsSectionId,
  type PasswordDraft,
} from "@/lib/settings"

type Status = {
  tone: "error" | "success"
  title: string
  detail?: string
}

type PasswordRowProps = {
  id: string
  label: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggle: () => void
}

function PasswordRow({
  id,
  label,
  autoComplete,
  value,
  onChange,
  visible,
  onToggle,
}: PasswordRowProps) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-2 rounded-md border border-border bg-background px-3.5">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={label}
        aria-label={label}
        className="w-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={visible}
        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {visible ? (
          <EyeOff className="size-[15px]" strokeWidth={3.2} />
        ) : (
          <Eye className="size-[15px]" strokeWidth={3.2} />
        )}
      </button>
    </div>
  )
}

/**
 * Account: change the password, and end sessions elsewhere.
 *
 * The rule checklist is live — every line is derived from the same draft the
 * fields edit — so the tick marks mean something before "Update password" is
 * pressed. Submitting only validates: no password API exists yet, so a passing
 * form reports that the change stayed in this tab rather than claiming a write.
 */
export function AccountCard() {
  const [draft, setDraft] = useState<PasswordDraft>(emptyPasswordDraft)
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [status, setStatus] = useState<Status | null>(null)

  const rules = accountPasswordRules()

  function update(patch: Partial<PasswordDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setStatus(null)
  }

  function toggle(key: keyof PasswordDraft) {
    setVisible((current) => ({ ...current, [key]: !current[key] }))
  }

  function updatePassword() {
    const error = passwordFormError(draft)
    if (error) {
      setStatus({
        tone: "error",
        title: "Check the fields above.",
        detail: error,
      })
      return
    }

    setDraft(emptyPasswordDraft())
    setVisible({ current: false, next: false, confirm: false })
    setStatus({
      tone: "success",
      title: "Password updated in this tab.",
      detail: "There is no password API yet — this change is not persisted.",
    })
  }

  function signOutOtherDevices() {
    setStatus({
      tone: "success",
      title: "Other devices signed out (demo).",
      detail: "Sign-in history is not stored yet.",
    })
  }

  return (
    <section
      id={settingsSectionId("account")}
      className="flex scroll-mt-24 flex-col gap-3 rounded-lg border border-border bg-card p-5"
    >
      <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
        အကောင့် • Account
      </h2>

      <PasswordRow
        id="account-current-password"
        label="Current password"
        autoComplete="current-password"
        value={draft.current}
        onChange={(current) => update({ current })}
        visible={visible.current}
        onToggle={() => toggle("current")}
      />

      <PasswordRow
        id="account-new-password"
        label="New password"
        autoComplete="new-password"
        value={draft.next}
        onChange={(next) => update({ next })}
        visible={visible.next}
        onToggle={() => toggle("next")}
      />

      <PasswordRow
        id="account-confirm-password"
        label="Confirm new"
        autoComplete="new-password"
        value={draft.confirm}
        onChange={(confirm) => update({ confirm })}
        visible={visible.confirm}
        onToggle={() => toggle("confirm")}
      />

      <div className="flex flex-col gap-1 rounded-md border border-border bg-background px-3.5 py-2.5">
        {rules.map((rule) => {
          const passed = rule.test(draft)

          return (
            <div key={rule.id} className="flex items-center gap-1.5 text-xs">
              {passed ? (
                <CircleCheck
                  className="size-[13px] shrink-0 text-primary"
                  strokeWidth={3.7}
                />
              ) : (
                <Circle
                  className="size-[13px] shrink-0 text-muted-foreground"
                  strokeWidth={3.7}
                />
              )}
              <span
                className={cn(
                  passed
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>

      {status ? (
        <FormAlert
          tone={status.tone}
          title={status.title}
          detail={status.detail}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={updatePassword}
          className="min-h-12 flex-1 px-4 text-sm font-bold"
        >
          Update password
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={signOutOtherDevices}
          className="min-h-12 flex-1 px-4 text-sm font-bold"
        >
          Sign out other devices
        </Button>
      </div>
    </section>
  )
}
