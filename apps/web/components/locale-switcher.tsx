"use client"

import { useLocale, useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"

import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

/**
 * Switches between Myanmar and English in place. The query string is carried
 * over so a filtered catalogue view is not reset.
 */
export default function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations("Locale")
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === locale) return

    const search = window.location.search
    router.replace(`${pathname}${search}`, { locale: next })
  }

  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
        {t("label")}
      </span>
      <div
        role="group"
        aria-label={t("label")}
        className="flex flex-1 gap-1 rounded-md border border-border bg-secondary p-1"
      >
        {routing.locales.map((option) => {
          const active = option === locale

          return (
            <button
              key={option}
              type="button"
              onClick={() => switchTo(option)}
              aria-pressed={active}
              className={cn(
                "min-h-[44px] flex-1 rounded-sm font-body text-xs font-semibold",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {t(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
