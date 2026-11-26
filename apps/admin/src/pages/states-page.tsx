import { Button } from "@workspace/ui/components/button"
import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { AccessDeniedCard } from "@/components/states/access-denied"
import { DashboardSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { SessionExpiredPanel } from "@/components/states/session-expired"

const CAPTION = "text-[11px] font-bold text-muted-foreground"

/**
 * `/states` — the design's "စနစ်အခြေအနေများ" sheet: the four utility states
 * side by side so they can be checked in one place.
 *
 * It is a preview, not a daily-use screen, so it is not in the sidebar; the
 * screens themselves use the same components (`DashboardSkeleton`,
 * `RequestError`, `SessionExpiredDialog`, `AccessDeniedPage`). "Retry sync"
 * only demonstrates the retrying affordance — there is no sync to run.
 */
export function StatesPage() {
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!retrying) return

    const timer = window.setTimeout(() => setRetrying(false), 1400)
    return () => window.clearTimeout(timer)
  }, [retrying])

  return (
    <>
      <AdminPageHeader
        title="စနစ်အခြေအနေများ"
        subtitle="Utility states • loading / error / session / access"
        actions={
          <Button
            onClick={() => setRetrying(true)}
            disabled={retrying}
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <RefreshCw
              className={retrying ? "size-4 animate-spin" : "size-4"}
              strokeWidth={3}
            />
            Retry sync
          </Button>
        }
      />

      <main className="grid items-start gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <p className={CAPTION}>1 • LOADING SKELETON • DASHBOARD</p>
          <DashboardSkeleton
            kpis={3}
            rows={4}
            showTitle={false}
            className="gap-2.5 pt-3"
          />
          <p className="pt-2 font-body text-xs leading-[1.7] text-muted-foreground">
            Soft gray shimmer blocks • no spinners for tables.
          </p>
        </section>

        <RequestError
          caption="2 • ERROR • FAILED REQUEST"
          detail="Something went wrong • orders could not load"
          onRetry={() => setRetrying(true)}
          retrying={retrying}
        />

        <div className="flex justify-center rounded-lg border border-border bg-muted/60 p-6">
          <div className="flex w-full max-w-[380px] flex-col items-center rounded-lg border border-border bg-card p-6">
            <p className={CAPTION}>3 • SESSION EXPIRED MODAL</p>
            <SessionExpiredPanel className="pt-2" />
          </div>
        </div>

        <AccessDeniedCard caption="4 • ACCESS DENIED • STAFF → OWNER PAGE" />
      </main>
    </>
  )
}
