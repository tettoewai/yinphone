import { defineRouting } from "next-intl/routing"

/**
 * Myanmar is the default, so its URLs stay unprefixed (`/catalog`) while
 * English lives under `/en` (`/en/catalog`).
 *
 * `localeDetection` is off so browsers to land on Myanmar regardless of their
 * `accept-language` header or a stale locale cookie. English is opt-in via the
 * locale switcher (which navigates to `/en`).
 */
export const routing = defineRouting({
  locales: ["my", "en"],
  defaultLocale: "my",
  localePrefix: "as-needed",
  localeDetection: false,
})
