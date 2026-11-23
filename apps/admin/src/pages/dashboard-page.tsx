import { Button } from "@workspace/ui/components/button"
import { Leaf, LogOut } from "lucide-react"

import { useSession } from "@/auth/session-context"

export function DashboardPage() {
  const { user, signOut } = useSession()

  return (
    <div className="flex min-h-svh flex-col bg-background font-body">
      <header className="flex min-h-16 items-center justify-between border-b border-border bg-card px-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary">
            <Leaf
              className="size-[19px] text-primary-foreground"
              strokeWidth={2.5}
            />
          </span>
          <div>
            <div className="font-heading text-base leading-tight font-bold text-foreground">
              YinPhone Boutique
            </div>
            <div className="text-xs text-muted-foreground">
              Admin console • Asia/Yangon
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-bold text-foreground">
              {user?.name}
            </div>
            <div className="text-xs text-muted-foreground">{user?.role}</div>
          </div>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            မင်္ဂလာပါ, {user?.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            You are signed in as <strong>{user?.email}</strong>. The dashboard
            screens (orders, products, overview) are the next step — the auth
            flow, forced password reset, and session handling are all wired to
            the API.
          </p>
        </div>
      </main>
    </div>
  )
}
