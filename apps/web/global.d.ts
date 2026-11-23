import messages from "./messages/en.json"
import type { routing } from "./i18n/routing"

/**
 * Teaches use-intl (and therefore next-intl) about this app's locales and
 * message shape, so `t()` calls with an unknown key and `useLocale()` results
 * are checked by `tsc`.
 */
declare module "use-intl/core" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
