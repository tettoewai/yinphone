/**
 * Data hook for the dashboard overview.
 *
 * Same shape as `use-orders.ts`: a fetch-with-abort effect where `loading` is
 * derived by comparing the resolved request key with the one being asked for,
 * so the effect never calls `setState` synchronously. A reload keeps the
 * previous payload on screen while the next request runs.
 */

import { useCallback, useEffect, useState } from "react"

import { dashboardApi, type AdminDashboardOverview } from "@/lib/api"

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

export type DashboardState = {
  overview: AdminDashboardOverview | null
  error: unknown
  /** True until the first payload has arrived. */
  loading: boolean
  /** True while a reload runs; the previous payload stays visible. */
  refreshing: boolean
  reload: () => void
}

type OverviewResult = {
  key: number
  data: AdminDashboardOverview | null
  error: unknown
}

export function useDashboardOverview(): DashboardState {
  const [resolved, setResolved] = useState<OverviewResult | null>(null)
  const [token, setToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    dashboardApi
      .overview(controller.signal)
      .then((data) => setResolved({ key: token, data, error: null }))
      .catch((failure: unknown) => {
        if (isAbortError(failure)) return

        // Keep the last good payload so a failed refresh still shows numbers.
        setResolved((current) => ({
          key: token,
          data: current?.data ?? null,
          error: failure,
        }))
      })

    return () => controller.abort()
  }, [token])

  const reload = useCallback(() => setToken((current) => current + 1), [])

  const pending = resolved?.key !== token
  const data = resolved?.data ?? null
  const error = pending ? null : (resolved?.error ?? null)

  return {
    overview: data,
    error,
    loading: pending && data === null,
    refreshing: pending && data !== null,
    reload,
  }
}
