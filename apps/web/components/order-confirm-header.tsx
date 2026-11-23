import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { formatPrice } from "@/components/catalog-data"

type OrderConfirmHeaderProps = {
  productSlug: string
  title: string
  price: number
}

export default function OrderConfirmHeader({
  productSlug,
  title,
  price,
}: OrderConfirmHeaderProps) {
  return (
    <header className="flex items-center gap-1 border-b border-border bg-background px-3 py-2">
      <Link
        href={`/products/${productSlug}`}
        aria-label="Go back to product"
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md"
      >
        <ArrowLeft className="size-[22px] text-foreground" strokeWidth={2.2} />
      </Link>

      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate font-body text-base leading-[1.7] font-bold text-foreground">
          {title}
        </h1>
        <div className="-mt-1 text-xs text-muted-foreground">
          {formatPrice(price)}
        </div>
      </div>

      <div className="w-[44px] shrink-0" />
    </header>
  )
}
