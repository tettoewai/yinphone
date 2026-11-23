import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

/**
 * Locale routing: rewrites unprefixed requests to the default (Myanmar)
 * locale and keeps `/en/...` for English. This file is `proxy.ts` rather than
 * `middleware.ts` because Next 16 renamed the convention.
 */
export default createMiddleware(routing)

export const config = {
  // Skip API routes, Next internals and anything that looks like a file.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
