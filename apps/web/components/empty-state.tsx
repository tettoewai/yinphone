"use client"

import { RotateCcw, ShoppingBasket } from "lucide-react"
import { useTranslations } from "next-intl"

type EmptyStateProps = {
  onClear: () => void
}

export default function EmptyState({ onClear }: EmptyStateProps) {
  const t = useTranslations("Catalog.empty")

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
        <ShoppingBasket
          className="size-[34px] text-primary"
          strokeWidth={1.41}
        />
      </div>
      <div className="font-body text-base leading-[1.7] font-semibold text-foreground">
        {t("title")}
      </div>
      <div className="font-body text-sm leading-[1.7] text-muted-foreground">
        {t("hint")}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 flex min-h-[44px] items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        <RotateCcw className="size-[15px]" strokeWidth={3.2} />
        <span className="font-body">{t("clear")}</span>
      </button>
    </div>
  )
}
