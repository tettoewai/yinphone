import { notFound } from "next/navigation"

/**
 * Unknown paths inside a locale must resolve under `[locale]` so the localized
 * `not-found.tsx` renders with the right language, layout and theme. Without
 * this, Next falls back to its built-in 404 page.
 */
export default function CatchAllPage(): never {
  notFound()
}
