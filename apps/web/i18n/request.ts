import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { locale as rootLocale } from "next/root-params"

import { routing } from "./routing"

/**
 * Resolves the locale from the `[locale]` root segment and loads its message
 * catalogue. Unknown segments fall back to Myanmar instead of 404ing here, so
 * the proxy can still rewrite them.
 */
export default getRequestConfig(async () => {
  const requested = await rootLocale()
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
