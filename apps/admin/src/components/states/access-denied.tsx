import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { LayoutDashboard, ShieldX } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { useSession } from "@/auth/session-context"
import { MESSENGER_URL } from "@/lib/contact"
import { ROUTES } from "@/lib/routes"

/**
 * The denied card on its own, so the states preview can show it beside the
 * other utilities. `AccessDeniedPage` below is the full-screen placement the
 * Owner-only guard uses.
 */
export function AccessDeniedCard({
  caption,
  className,
}: {
  caption?: ReactNode
  className?: string
}) {
  const { user } = useSession()

  return (
    <section
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

      <span className="flex size-14 items-center justify-center rounded-xl border border-accent bg-accent/20">
        <ShieldX
          className="size-[26px] text-accent-foreground"
          strokeWidth={2.1}
        />
      </span>

      <h1 className="pt-2 font-body text-base leading-[1.7] font-bold text-foreground">
        ဤစာမျက်နှာကို ကြည့်ခွင့်မရှိပါ
      </h1>
      <p className="text-sm text-muted-foreground">
        You don&apos;t have permission to view this page.
        <br />
        Team settings are Owner-only • signed in as{" "}
        {user?.role === "OWNER" ? "Owner" : "Staff"}.
      </p>

      <div className="flex flex-wrap justify-center gap-2 pt-4">
        <Link
          to={ROUTES.dashboard}
          className={cn(
            buttonVariants(),
            "min-h-12 gap-1.5 rounded-md px-6 text-sm font-bold"
          )}
        >
          <LayoutDashboard className="size-[15px]" strokeWidth={3.2} />
          Back to dashboard
        </Link>
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-12 rounded-md px-5 text-sm font-bold"
          )}
        >
          Ask owner
        </a>
      </div>
    </section>
  )
}

/**
 * Shown inside the admin shell when a signed-in Staff account opens a screen
 * that only an Owner may use (the settings team roster is the first one).
 *
 * "Back to dashboard" is the primary action because the page the user asked for
 * is closed to them; "Ask owner" leaves the app entirely, to the shop's
 * Messenger, where the owner can make the change instead.
 */
export function AccessDeniedPage() {
  return (
    <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6">
      <AccessDeniedCard className="w-full max-w-[520px]" />
    </main>
  )
}
