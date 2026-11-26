/**
 * Data hook for the products list.
 *
 * Same shape as `use-orders.ts`: there is no query library, so this is a small
 * fetch-with-abort effect. A newer request cancels the one in flight and the
 * previous page stays on screen while the next one loads. `loading` is derived
 * by comparing the resolved request key with the one the render is asking for,
 * which keeps the effect free of synchronous `setState` calls.
 */

import { useCallback, useEffect, useState } from "react"

import { productsApi, type AdminProductPage } from "@/lib/api"
import type { ProductSort, StockFilter, VisibilityFilter } from "@/lib/products"

/** Typing a search should not fire a request per keystroke. */
const QUERY_DEBOUNCE_MS = 250

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

export type ProductListParams = {
  q: string
  /** Category slug, or `"all"`. */
  category: string
  stock: StockFilter
  visibility: VisibilityFilter
  sort: ProductSort
  page: number
  pageSize: number
}

export type ProductListState = {
  page: AdminProductPage | null
  error: unknown
  /** True until the first page for this screen has arrived. */
  loading: boolean
  /** True while a later request runs; the previous page stays visible. */
  refreshing: boolean
  reload: () => void
}

type ListResult = {
  key: string
  data: AdminProductPage | null
  error: unknown
}

export function useProductList(params: ProductListParams): ProductListState {
  const { q, category, stock, visibility, sort, page, pageSize } = params
  const debouncedQuery = useDebounced(q, QUERY_DEBOUNCE_MS)
  const trimmedQuery = debouncedQuery.trim()

  const [resolved, setResolved] = useState<ListResult | null>(null)
  const [token, setToken] = useState(0)

  const key = [
    trimmedQuery,
    category,
    stock,
    visibility,
    sort,
    page,
    pageSize,
    token,
  ].join("|")

  useEffect(() => {
    const controller = new AbortController()

    productsApi
      .list(
        {
          q: trimmedQuery || undefined,
          category: category === "all" ? undefined : category,
          stock,
          visibility,
          sort,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        },
        controller.signal
      )
      .then((data) => setResolved({ key, data, error: null }))
      .catch((failure: unknown) => {
        if (isAbortError(failure)) return

        // Keep the last good page so a failed refresh still shows rows.
        setResolved((current) => ({
          key,
          data: current?.data ?? null,
          error: failure,
        }))
      })

    return () => controller.abort()
  }, [key, trimmedQuery, category, stock, visibility, sort, page, pageSize])

  const reload = useCallback(() => setToken((current) => current + 1), [])

  const pending = resolved?.key !== key
  const data = resolved?.data ?? null
  const error = pending ? null : (resolved?.error ?? null)

  return {
    page: data,
    error,
    loading: pending && data === null,
    refreshing: pending && data !== null,
    reload,
  }
}
