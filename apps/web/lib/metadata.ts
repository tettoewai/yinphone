import type { Locale } from "next-intl"

import { getPathname } from "@/i18n/navigation"

/**
 * Canonical and `hreflang` links for a route that exists at the same path in
 * both locales. `getPathname` honours `localePrefix: "as-needed"`, so Myanmar
 * stays unprefixed.
 */
export function alternatesFor(locale: Locale, href: string) {
  return {
    canonical: getPathname({ locale, href }),
    languages: {
      my: getPathname({ locale: "my", href }),
      en: getPathname({ locale: "en", href }),
      "x-default": getPathname({ locale: "my", href }),
    },
  }
}
