/**
 * Data hook for the channels screen.
 *
 * There are only a handful of channels, so `GET /api/admin/channels` returns
 * them all at once (no paging). Saving writes each edited row and then calls
 * `reload()`; this hook only owns the fetch, abort and error state.
 */

import { useCallback, useEffect, useState } from "react"

import { channelsApi, type AdminChannel } from "@/lib/api"

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

export type ChannelListState = {
  channels: AdminChannel[] | null
  error: unknown
  loading: boolean
  refreshing: boolean
  reload: () => void
}

type ListResult = {
  key: number
  data: AdminChannel[] | null
  error: unknown
}

export function useChannels(): ChannelListState {
  const [resolved, setResolved] = useState<ListResult | null>(null)
  const [token, setToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    channelsApi
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
    channels: data,
    error,
    loading: pending && data === null,
    refreshing: pending && data !== null,
    reload,
  }
}
