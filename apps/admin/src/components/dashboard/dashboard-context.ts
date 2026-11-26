import { createContext, useContext } from "react"

import type { DashboardState } from "@/hooks/use-dashboard"

export const DashboardContext = createContext<DashboardState | null>(null)

/**
 * The overview the admin shell fetched once, shared by the dashboard page and
 * the sidebar's pending-orders chip.
 */
export function useDashboard() {
  const dashboard = useContext(DashboardContext)

  if (!dashboard) {
    throw new Error("useDashboard must be used inside <DashboardProvider>")
  }

  return dashboard
}
