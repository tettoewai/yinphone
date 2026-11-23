import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useSession } from "@/auth/session-context"
import { peekPassword } from "@/lib/pending-password"
import { ROUTES, landingFor } from "@/lib/routes"

function SessionSplash() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <p className="font-body text-sm text-muted-foreground">
        ခဏစောင့်ပါ… • Loading…
      </p>
    </div>
  )
}

/** Keeps a signed-in admin away from the login screen. */
export function RequireSignedOut({ children }: { children: ReactNode }) {
  const { status, user } = useSession()

  if (status === "loading") return <SessionSplash />
  if (user) return <Navigate to={landingFor(user)} replace />

  return <>{children}</>
}

/**
 * Requires a session *and* a password that has already been rotated. A user
 * still on a temporary password can only reach the reset screen.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useSession()

  if (status === "loading") return <SessionSplash />
  if (!user) return <Navigate to={ROUTES.login} replace />
  if (user.mustChangePassword) {
    return <Navigate to={ROUTES.resetPassword} replace />
  }

  return <>{children}</>
}

/**
 * Requires a session plus a forced reset in progress. The remembered password
 * is what the reset screen submits, so without it (a reload, say) there is
 * nothing to send and the user has to authenticate again.
 */
export function RequirePasswordReset({ children }: { children: ReactNode }) {
  const { status, user } = useSession()

  if (status === "loading") return <SessionSplash />
  if (!user) return <Navigate to={ROUTES.login} replace />
  if (!user.mustChangePassword && !peekPassword()) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <>{children}</>
}
