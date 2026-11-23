"use client"

import { Info, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  const t = useTranslations("Errors")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col items-center px-6 py-16 text-center font-body">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
        <Info className="size-[34px] text-primary" strokeWidth={1.6} />
      </div>
      <h1 className="pt-5 font-body text-xl leading-[1.7] font-bold text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-[280px] pt-2 font-body text-sm leading-[1.8] text-muted-foreground">
        {t("body")}
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-bold text-primary-foreground"
      >
        <RotateCcw className="size-4" strokeWidth={3.2} />
        {t("retry")}
      </button>
    </div>
  )
}
