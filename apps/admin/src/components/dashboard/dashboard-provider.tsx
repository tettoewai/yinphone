import type { ReactNode } from "react"

import { DashboardContext } from "@/components/dashboard/dashboard-context"
import { useDashboardOverview } from "@/hooks/use-dashboard"

/**
 * Fetches the dashboard overview once for the signed-in admin shell. Mounted
 * above the layout's `<Outlet />`, so every admin screen — and the sidebar's
 * pending-orders chip — read the same request instead of each firing its own.
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useDashboardOverview()

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
