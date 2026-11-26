import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Trash2, UserPlus } from "lucide-react"
import { useRef, useState } from "react"

import {
  DEFAULT_INVITE_ROLE,
  isValidEmail,
  memberMeta,
  settingsSectionId,
  teammateInitial,
  type TeamMember,
  type TeamRole,
} from "@/lib/settings"

const ROLES: readonly { value: TeamRole; label: string }[] = [
  { value: "STAFF", label: "Staff" },
  { value: "OWNER", label: "Owner" },
]

type TeamCardProps = {
  members: readonly TeamMember[]
  onInvite: (email: string, role: TeamRole) => void
  onRemove: (id: string) => void
}

/**
 * Team roster plus the invite panel from the design.
 *
 * The panel is inline rather than in a modal: the design shows its contents so
 * the owner can see both the form and the roster while typing, and this screen
 * has nothing else to cover. An invite only appends a local row — the owner
 * itself can never be removed, which is why its row has no trash button.
 */
export function TeamCard({ members, onInvite, onRemove }: TeamCardProps) {
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamRole>(DEFAULT_INVITE_ROLE)
  const [error, setError] = useState<string>()
  const [invitedTo, setInvitedTo] = useState<string>()

  function submit() {
    const clean = email.trim().toLowerCase()
    if (!isValidEmail(clean)) {
      setError("Enter a valid email address • အီးမေးလ် မှန်ကန်စွာ ထည့်ပါ။")
      return
    }
    if (members.some((member) => member.email.toLowerCase() === clean)) {
      setError(
        "This email is already on the team • ဤအီးမေးလ် အဖွဲ့တွင် ရှိပြီးဖြစ်သည်။"
      )
      return
    }

    onInvite(clean, role)
    setEmail("")
    setError(undefined)
    setInvitedTo(clean)
  }

  return (
    <section
      id={settingsSectionId("team")}
      className="scroll-mt-24 rounded-lg border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
          အဖွဲ့ • Team ({members.length})
        </h2>
        <Button
          type="button"
          onClick={() => emailRef.current?.focus()}
          className="min-h-11 gap-1.5 rounded-md px-4 text-[13px] font-bold"
        >
          <UserPlus className="size-3.5" strokeWidth={3.4} />
          Invite staff
        </Button>
      </div>

      <div className="flex flex-col gap-2 pt-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-md border border-border bg-background px-3.5 py-2.5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold text-primary">
              {teammateInitial(member.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-foreground">
                {member.name}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {memberMeta(member)}
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-sm px-2 py-0.5 text-[11px] font-bold",
                member.role === "OWNER"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {member.role === "OWNER" ? "Owner" : "Staff"}
            </span>
            {member.role === "STAFF" ? (
              <button
                type="button"
                onClick={() => onRemove(member.id)}
                aria-label={`Remove ${member.name}`}
                title={`Remove ${member.name}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Trash2 className="size-[15px]" strokeWidth={3.2} />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="mt-3 rounded-md border-2 border-primary bg-background p-3.5"
      >
        <div className="text-[13px] font-bold text-foreground">
          Invite modal • ဝန်ထမ်းဖိတ်ရန်
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex min-h-12 items-center rounded-md border border-border bg-card px-3.5">
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError(undefined)
                setInvitedTo(undefined)
              }}
              autoComplete="off"
              placeholder="email • staff@yinphone.shop"
              aria-label="Staff email"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "invite-error" : undefined}
              className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {error ? (
            <p
              id="invite-error"
              role="alert"
              className="text-xs text-accent-foreground"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            {ROLES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                aria-pressed={role === option.value}
                className={cn(
                  "flex min-h-11 flex-1 items-center justify-center rounded-md text-sm font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  role === option.value
                    ? "bg-secondary text-secondary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {invitedTo ? (
            <p role="status" className="text-xs font-semibold text-primary">
              Invite sent to {invitedTo} • added to the team below.
            </p>
          ) : null}

          <Button type="submit" className="min-h-12 w-full text-sm font-bold">
            Send invite
          </Button>
        </div>
      </form>

      <p className="pt-2 text-xs text-muted-foreground">
        Staff cannot see this tab • Owners can remove staff.
      </p>
    </section>
  )
}
