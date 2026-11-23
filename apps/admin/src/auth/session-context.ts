import { createContext, useContext } from "react"

import type { AdminUser, LoginInput } from "@/lib/api"

export type SessionStatus = "loading" | "signed-out" | "signed-in"

export type SessionValue = {
  status: SessionStatus
  user: AdminUser | null
  signIn: (input: LoginInput) => Promise<AdminUser>
  signOut: () => Promise<void>
  /** Replaces the cached user, e.g. after `mustChangePassword` is cleared. */
  applyUser: (user: AdminUser) => void
}

export const SessionContext = createContext<SessionValue | null>(null)

export function useSession() {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error("useSession must be used inside <SessionProvider>")
  }

  return session
}
