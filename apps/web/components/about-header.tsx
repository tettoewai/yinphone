import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

export default async function AboutHeader() {
  const t = await getTranslations("About.header")
  const common = await getTranslations("Common")

  return (
    <header className="flex items-center gap-1 border-b border-border bg-background px-3 py-2">
      <Link
        href="/"
        aria-label={common("goHome")}
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md"
      >
        <ArrowLeft className="size-[22px] text-foreground" strokeWidth={2.2} />
      </Link>

      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate font-body text-base leading-[1.7] font-bold text-foreground">
          {t("title")}
        </h1>
        <div className="-mt-1 text-xs text-muted-foreground">
          {t("subtitle")}
        </div>
      </div>

      <div className="w-[44px] shrink-0" />
    </header>
  )
}
