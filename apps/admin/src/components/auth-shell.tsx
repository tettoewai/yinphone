import { Leaf, Lock } from "lucide-react"
import type { ReactNode } from "react"

import { MESSENGER_HANDLE, MESSENGER_URL } from "@/lib/contact"

/**
 * Shared chrome for the signed-out screens: the shop bar from the design, the
 * centred content column, and the footer. The mock's language toggle and
 * "Demo build" chip are left out — both are portfolio chrome with nothing
 * behind them, and the screens are already bilingual inline.
 */
export function AuthShell({ children }: { children: ReactNode }) {
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
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Lock className="size-[13px]" strokeWidth={3.7} />
          Secure sign-in
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-6 py-3 text-xs text-muted-foreground sm:px-8">
        <span>YinPhone Boutique • Admin console • Asia/Yangon</span>
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Need access? {MESSENGER_HANDLE}
        </a>
      </footer>
    </div>
  )
}
