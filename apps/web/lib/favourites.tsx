"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "yinphone:favourites"

type FavouritesValue = {
  ids: string[]
  count: number
  isReady: boolean
  isFavourite: (id: string) => boolean
  toggle: (id: string) => void
  clear: () => void
}

const FavouritesContext = createContext<FavouritesValue | null>(null)

function readStoredIds() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((id): id is string => typeof id === "string")
  } catch {
    // Storage can be blocked or contain stale data; favourites start empty.
    return []
  }
}

export function FavouritesProvider({ children }: { children: ReactNode }) {
  // Starts empty so the server render and first client render agree, then
  // hydrates from localStorage on mount.
  const [ids, setIds] = useState<string[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIds(readStoredIds())
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // Storage can be full or blocked; the in-memory list still works.
    }
  }, [ids, isReady])

  const toggle = useCallback((id: string) => {
    setIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    )
  }, [])

  const clear = useCallback(() => setIds([]), [])

  const value = useMemo<FavouritesValue>(
    () => ({
      ids,
      count: ids.length,
      isReady,
      isFavourite: (id: string) => ids.includes(id),
      toggle,
      clear,
    }),
    [ids, isReady, toggle, clear]
  )

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  )
}

export function useFavourites() {
  const context = useContext(FavouritesContext)

  if (!context) {
    throw new Error("useFavourites must be used within FavouritesProvider")
  }

  return context
}
