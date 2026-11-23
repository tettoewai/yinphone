import { defineRouting } from "next-intl/routing"

/**
 * Myanmar is the default, so its URLs stay unprefixed (`/catalog`) while
 * English lives under `/en` (`/en/catalog`).
 */
export const routing = defineRouting({
  locales: ["my", "en"],
  defaultLocale: "my",
  localePrefix: "as-needed",
})
