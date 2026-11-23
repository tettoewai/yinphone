"use client"

import { MessageCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"
import { formatPrice } from "@/lib/format"

type OrderBarProps = {
  /** Order summary route, carrying the selected size/colour. */
  orderHref: string
  price: number
  soldOut?: boolean
}

export default function OrderBar({
  orderHref,
  price,
  soldOut = false,
}: OrderBarProps) {
  const locale = useLocale()
  const t = useTranslations("Order")
  const common = useTranslations("Common")

  const buttonClassName =
    "flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-md text-[15px] font-bold transition-colors"

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border bg-card px-4 py-3">
      <div className="shrink-0">
        <div className="text-xs leading-none text-muted-foreground">
          {t("total")}
        </div>
        <div className="mt-0.5 font-heading text-lg font-bold text-primary">
          {formatPrice(price, locale)}
        </div>
      </div>

      {soldOut ? (
        <button
          type="button"
          disabled
          className={cn(buttonClassName, "bg-secondary text-muted-foreground")}
        >
          <span className="font-body leading-[1.7]">
            {common("outOfStock")}
          </span>
        </button>
      ) : (
        <Link
          href={orderHref}
          className={cn(
            buttonClassName,
            "bg-messenger text-primary-foreground"
          )}
        >
          <MessageCircle className="size-[19px]" strokeWidth={2.53} />
          <span className="font-body leading-[1.7]">{common("order")}</span>
        </Link>
      )}
    </div>
  )
}
