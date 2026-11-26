/**
 * Data hooks for the orders screens.
 *
 * There is no query library in this app, so each hook is a small
 * fetch-with-abort effect: a newer request cancels the one in flight, and the
 * previous page stays on screen while the next one loads.
 *
 * State is stored as "the last resolved request" rather than a `loading` flag
 * flipped at the top of the effect. `loading` is then derived by comparing that
 * key with the request the render is asking for, which keeps the effect free of
 * synchronous `setState` calls (and the cascading renders they cause).
 */

import { useCallback, useEffect, useState } from "react"

import {
  ordersApi,
  type AdminOrderDetail,
  type AdminOrderPage,
} from "@/lib/api"
import type {
  ChannelSlug,
  DateRangeKey,
  OrderStatus,
  PageSize,
} from "@/lib/orders"

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

export type OrderListParams = {
  q: string
  channel: ChannelSlug | "all"
  status: OrderStatus | "all"
  range: DateRangeKey
  page: number
  pageSize: PageSize
}

export type OrderListState = {
  page: AdminOrderPage | null
  error: unknown
  /** True until the first page for this screen has arrived. */
  loading: boolean
  /** True while a later request runs; the previous page stays visible. */
  refreshing: boolean
  reload: () => void
}

type ListResult = {
  key: string
  data: AdminOrderPage | null
  error: unknown
}

export function useOrderList(params: OrderListParams): OrderListState {
  const { q, channel, status, range, page, pageSize } = params
  const debouncedQuery = useDebounced(q, QUERY_DEBOUNCE_MS)
  const trimmedQuery = debouncedQuery.trim()

  const [resolved, setResolved] = useState<ListResult | null>(null)
  const [token, setToken] = useState(0)

  // Everything that changes the request, so a render can tell whether the
  // resolved page still answers what is being asked for.
  const key = [
    trimmedQuery,
    channel,
    status,
    range,
    page,
    pageSize,
    token,
  ].join("|")

  useEffect(() => {
    const controller = new AbortController()

    ordersApi
      .list(
        {
          q: trimmedQuery || undefined,
          channel: channel === "all" ? undefined : channel,
          status: status === "all" ? undefined : status,
          range,
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
  }, [key, trimmedQuery, channel, status, range, page, pageSize])

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

export type OrderDetailState = {
  order: AdminOrderDetail | null
  error: unknown
  loading: boolean
  reload: () => void
}

type DetailResult = {
  key: string
  order: AdminOrderDetail | null
  error: unknown
}

export function useOrderDetail(code: string | undefined): OrderDetailState {
  const [resolved, setResolved] = useState<DetailResult | null>(null)
  const [token, setToken] = useState(0)

  const key = code ? `${code}#${token}` : null

  useEffect(() => {
    if (!code || key === null) return

    const controller = new AbortController()

    ordersApi
      .get(code, controller.signal)
      .then((order) => setResolved({ key, order, error: null }))
      .catch((failure: unknown) => {
        if (isAbortError(failure)) return
        setResolved({ key, order: null, error: failure })
      })

    return () => controller.abort()
  }, [code, key])

  const reload = useCallback(() => setToken((current) => current + 1), [])

  // A changed route param or a retry must not show the previous order.
  const matches = key !== null && resolved?.key === key

  return {
    order: matches ? (resolved?.order ?? null) : null,
    error: matches ? (resolved?.error ?? null) : null,
    loading: key !== null && !matches,
    reload,
  }
}
