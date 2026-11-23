import { type ReactNode, useEffect, useState } from "react"

import {
  SessionContext,
  type SessionStatus,
  type SessionValue,
} from "@/auth/session-context"
import { authApi, type AdminUser, type LoginInput } from "@/lib/api"

/**
 * Holds the signed-in admin. The session itself lives in an httpOnly cookie,
 * so bootstrap is a single `GET /api/auth/me` on mount: a 401 there simply
 * means "signed out" and is the normal path, not an error worth surfacing.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [status, setStatus] = useState<SessionStatus>("loading")

  useEffect(() => {
    let active = true

    authApi
      .me()
      .then((response) => {
        if (!active) return

        setUser(response.user)
        setStatus("signed-in")
      })
      .catch(() => {
        if (!active) return

        setUser(null)
        setStatus("signed-out")
      })

    return () => {
      active = false
    }
  }, [])

  const signIn = async (input: LoginInput) => {
    const { user: signedIn } = await authApi.login(input)

    setUser(signedIn)
    setStatus("signed-in")

    return signedIn
  }

  const signOut = async () => {
    try {
      await authApi.logout()
    } catch {
      // The server clears the cookie even when the session was already gone,
      // so a failed call must not leave the UI stuck in a signed-in state.
    }

    setUser(null)
    setStatus("signed-out")
  }

  const value: SessionValue = {
    status,
    user,
    signIn,
    signOut,
    applyUser: setUser,
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
