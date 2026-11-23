import { createNavigation } from "next-intl/navigation"

import { routing } from "./routing"

/**
 * Locale-aware replacements for `next/link` and `next/navigation`. Hrefs are
 * written without a locale prefix; these helpers add `/en` when needed.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
