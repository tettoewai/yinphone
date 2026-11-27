/**
 * Data hook for the settings team card.
 *
 * The roster is small, so `GET /api/admin/staff` returns every member at once
 * (no paging). Mutations live in the page and call `reload()` once the request
 * settles; this hook only owns the fetch, abort and error state.
 */

import { useCallback, useEffect, useState } from "react"

import { staffApi, type AdminStaffMember } from "@/lib/api"

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

export type StaffListState = {
  staff: AdminStaffMember[] | null
  error: unknown
  loading: boolean
  refreshing: boolean
  reload: () => void
}

type ListResult = {
  key: number
  data: AdminStaffMember[] | null
  error: unknown
}

export function useStaff(): StaffListState {
  const [resolved, setResolved] = useState<ListResult | null>(null)
  const [token, setToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    staffApi
      .list(controller.signal)
      .then((data) => setResolved({ key: token, data, error: null }))
      .catch((failure: unknown) => {
        if (isAbortError(failure)) return

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
    staff: data,
    error,
    loading: pending && data === null,
    refreshing: pending && data !== null,
    reload,
  }
}
