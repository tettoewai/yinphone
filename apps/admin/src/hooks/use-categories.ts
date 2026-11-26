/**
 * Data hook for the categories list.
 *
 * The list is small, so `GET /api/admin/categories` returns every row at once
 * (there is no paging). Mutations live in the page and call `reload()` once the
 * request settles; this hook only owns the fetch, abort and error state.
 */

import { useCallback, useEffect, useState } from "react"

import { categoriesApi, type AdminCategory } from "@/lib/api"

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

export type CategoryListState = {
  categories: AdminCategory[] | null
  error: unknown
  loading: boolean
  refreshing: boolean
  reload: () => void
}

type ListResult = {
  key: number
  data: AdminCategory[] | null
  error: unknown
}

export function useCategories(): CategoryListState {
  const [resolved, setResolved] = useState<ListResult | null>(null)
  const [token, setToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    categoriesApi
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
    categories: data,
    error,
    loading: pending && data === null,
    refreshing: pending && data !== null,
    reload,
  }
}
