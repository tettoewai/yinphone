import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Copy, Crown, Trash2, UserPlus, UserRound } from "lucide-react"
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

/** The invite's result, handed back so the card can show the one-time password. */
export type InviteOutcome =
  { ok: true; temporaryPassword: string } | { ok: false; message: string }

type TeamCardProps = {
  members: readonly TeamMember[]
  /** The signed-in owner; their own row has no role switch or trash button. */
  currentUserId: string
  /** A write is in flight, so the row actions are disabled. */
  busy: boolean
  onInvite: (email: string, role: TeamRole) => Promise<InviteOutcome>
  /** Resolves `true` when the change was saved. */
  onChangeRole: (member: TeamMember, role: TeamRole) => Promise<boolean>
  /** Resolves `true` when the member was removed. */
  onRemove: (member: TeamMember) => Promise<boolean>
}

/**
 * Team roster plus the invite panel from the design.
 *
 * The roster is `GET /api/admin/staff`; the panel creates an account and the
 * API returns its temporary password exactly once, so the card shows it for the
 * owner to pass on out-of-band. Role switches and removals write through the
 * API, and the server refuses to demote or remove the last owner or to let an
 * owner change their own role — the controls here disable those too.
 */
export function TeamCard({
  members,
  currentUserId,
  busy,
  onInvite,
  onChangeRole,
  onRemove,
}: TeamCardProps) {
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamRole>(DEFAULT_INVITE_ROLE)
  const [error, setError] = useState<string>()
  const [inviting, setInviting] = useState(false)
  const [invite, setInvite] = useState<{
    email: string
    password: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)

  const ownerCount = members.filter((member) => member.role === "OWNER").length

  async function submit() {
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

    setInviting(true)
    setError(undefined)
    setInvite(null)
    setCopied(false)

    const outcome = await onInvite(clean, role)

    setInviting(false)

    if (!outcome.ok) {
      setError(outcome.message)
      return
    }

    setEmail("")
    setInvite({ email: clean, password: outcome.temporaryPassword })
  }

  async function copyPassword() {
    if (!invite) return

    try {
      await navigator.clipboard.writeText(invite.password)
      setCopied(true)
    } catch {
      // Clipboard access needs a secure context; the password stays on screen
      // so the owner can select it by hand.
      setError("Copy failed — select the password and copy it manually.")
    }
  }

  async function confirmRemove() {
    if (!removeTarget) return

    const removed = await onRemove(removeTarget)
    if (removed) setRemoveTarget(null)
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
        {members.map((member) => {
          const isSelf = member.id === currentUserId
          const isLastOwner = member.role === "OWNER" && ownerCount <= 1

          return (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-3.5 py-2.5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold text-primary">
                {teammateInitial(member.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-foreground">
                  {member.name}
                  {isSelf ? (
                    <span className="pl-1 text-[11px] font-normal text-muted-foreground">
                      (you)
                    </span>
                  ) : null}
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

              {isSelf ? null : (
                <button
                  type="button"
                  onClick={() =>
                    void onChangeRole(
                      member,
                      member.role === "OWNER" ? "STAFF" : "OWNER"
                    )
                  }
                  disabled={busy || isLastOwner}
                  aria-label={
                    member.role === "OWNER"
                      ? `Make ${member.name} staff`
                      : `Make ${member.name} an owner`
                  }
                  title={
                    isLastOwner
                      ? "The shop needs at least one owner"
                      : member.role === "OWNER"
                        ? `Make ${member.name} staff`
                        : `Make ${member.name} an owner`
                  }
                  className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
                >
                  {member.role === "OWNER" ? (
                    <UserRound className="size-[15px]" strokeWidth={3.2} />
                  ) : (
                    <Crown className="size-[15px]" strokeWidth={3.2} />
                  )}
                </button>
              )}

              {isSelf || isLastOwner ? null : (
                <button
                  type="button"
                  onClick={() => setRemoveTarget(member)}
                  disabled={busy}
                  aria-label={`Remove ${member.name}`}
                  title={`Remove ${member.name}`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Trash2 className="size-[15px]" strokeWidth={3.2} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
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
                setCopied(false)
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

          <Button
            type="submit"
            disabled={inviting || busy}
            className="min-h-12 w-full text-sm font-bold"
          >
            {inviting ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </form>

      {invite ? (
        <div
          role="status"
          className="mt-3 rounded-md border border-primary bg-secondary/40 p-3.5"
        >
          <div className="text-[13px] font-bold text-foreground">
            Invite created for {invite.email}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <code className="min-w-0 flex-1 truncate rounded-sm border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground">
              {invite.password}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyPassword()}
              className="min-h-9 shrink-0 gap-1.5 px-3 text-xs font-bold"
            >
              {copied ? (
                <Check className="size-3.5" strokeWidth={3.4} />
              ) : (
                <Copy className="size-3.5" strokeWidth={3.4} />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="pt-2 text-[11px] text-muted-foreground">
            Share this one-time password out-of-band. They must replace it on
            first sign-in.
          </p>
        </div>
      ) : null}

      <p className="pt-2 text-xs text-muted-foreground">
        Staff cannot see this tab • Owners can promote or remove teammates; the
        last owner always stays.
      </p>

      {removeTarget ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setRemoveTarget(null)
          }}
        >
          <DialogContent>
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-accent-foreground">
                <Trash2 className="size-[19px]" strokeWidth={2.5} />
              </span>
              <DialogHeader>
                <DialogTitle>{removeTarget.name} ကို ဖယ်ရှားမလား?</DialogTitle>
                <DialogDescription>
                  {removeTarget.email} သည် ချက်ချင်း ထွက်ပြီး ပြန်ဝင်နိုင်မည်
                  မဟုတ်ပါ။
                </DialogDescription>
              </DialogHeader>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoveTarget(null)}
                className="min-h-11 px-6 text-sm font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void confirmRemove()}
                disabled={busy}
                className="min-h-11 gap-1.5 bg-accent px-6 text-sm font-bold text-accent-foreground hover:bg-accent/85"
              >
                <Trash2 className="size-[15px]" strokeWidth={3.2} />
                Remove teammate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </section>
  )
}
