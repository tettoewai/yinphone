"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Copies text and tracks which target was copied last so buttons can show a
 * transient "Copied" state.
 */
export function useClipboard(resetMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const copy = useCallback(
    async (value: string, key = "default") => {
      if (typeof navigator === "undefined" || !navigator.clipboard) return false

      try {
        await navigator.clipboard.writeText(value)
      } catch {
        return false
      }

      setCopiedKey(key)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopiedKey(null), resetMs)

      return true
    },
    [resetMs]
  )

  const reset = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setCopiedKey(null)
  }, [])

  return { copiedKey, copy, reset }
}
