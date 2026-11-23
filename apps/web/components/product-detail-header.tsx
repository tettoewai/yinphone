"use client"

import { ArrowLeft, Check, Share2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { Link } from "@/i18n/navigation"

type ProductDetailHeaderProps = {
  categoryName: string
}

export default function ProductDetailHeader({
  categoryName,
}: ProductDetailHeaderProps) {
  const [isCopied, setIsCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations("Product")
  const common = useTranslations("Common")

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const share = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url })
      } catch {
        // The share sheet was dismissed, so there is nothing to do.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Clipboard access was denied, so the icon stays unchanged.
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-background/95 px-3 py-2">
      <Link
        href="/catalog"
        aria-label={t("backToCatalog")}
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md"
      >
        <ArrowLeft className="size-[22px] text-foreground" strokeWidth={2.2} />
      </Link>

      <div className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-muted-foreground">
        {categoryName}
      </div>

      <button
        type="button"
        onClick={share}
        aria-label={isCopied ? common("linkCopied") : common("shareProduct")}
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-border bg-card"
      >
        {isCopied ? (
          <Check className="size-[18px] text-primary" strokeWidth={2.67} />
        ) : (
          <Share2 className="size-[18px] text-foreground" strokeWidth={2.67} />
        )}
      </button>
    </header>
  )
}
