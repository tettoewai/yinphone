/**
 * Data hook for one product, used by the editor's edit mode.
 *
 * Same shape as the other list hooks: a fetch-with-abort effect keyed by the
 * product id plus a reload token, so `loading` is derived by comparing the
 * resolved key with the one the render asks for and the effect never calls
 * `setState` synchronously. A blank id (the add form) fetches nothing.
 */

import { useCallback, useEffect, useState } from "react"

import { productsApi, type AdminProductDetail } from "@/lib/api"

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

export type ProductDetailState = {
  product: AdminProductDetail | null
  error: unknown
  /** True until the requested product has arrived. */
  loading: boolean
  reload: () => void
}

type DetailResult = {
  key: string
  data: AdminProductDetail | null
  error: unknown
}

export function useProduct(id: string | undefined): ProductDetailState {
  const [resolved, setResolved] = useState<DetailResult | null>(null)
  const [token, setToken] = useState(0)

  const key = `${id ?? ""}|${token}`

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    productsApi
      .get(id, controller.signal)
      .then((data) => setResolved({ key, data, error: null }))
      .catch((failure: unknown) => {
        if (isAbortError(failure)) return

        setResolved((current) => ({
          key,
          data: current?.data ?? null,
          error: failure,
        }))
      })

    return () => controller.abort()
  }, [id, key])

  const reload = useCallback(() => setToken((current) => current + 1), [])

  if (!id) {
    return { product: null, error: null, loading: false, reload }
  }

  const pending = resolved?.key !== key
  const data = resolved?.data ?? null

  return {
    product: data,
    error: pending ? null : (resolved?.error ?? null),
    loading: pending && data === null,
    reload,
  }
}
