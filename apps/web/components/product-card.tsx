import { MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { formatPrice, type CatalogProduct } from "@/components/catalog-data"

type ProductCardProps = {
  product: CatalogProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, image, alt, title, subtitle, price, badge, soldOut } = product
  const href = `/products/${id}`

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="relative">
        <Link href={href} aria-label={title} className="block">
          <Image
            src={image}
            alt={alt}
            width={480}
            height={640}
            sizes="(min-width: 448px) 224px, 50vw"
            className="aspect-[3/4] w-full object-cover"
          />
        </Link>
        {badge ? (
          <div className="absolute top-2 left-2 rounded-sm bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
            {badge}
          </div>
        ) : null}
        {soldOut ? (
          <div className="absolute bottom-2 left-2 rounded-sm bg-foreground/85 px-2 py-1 font-body text-xs leading-[1.7] font-semibold text-white">
            ကုန်နေပါပြီ • Sold out
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          href={href}
          className="line-clamp-2 font-body text-sm leading-[1.7] font-medium text-foreground"
        >
          {title}
        </Link>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        <div className="font-heading text-base font-bold text-primary">
          {formatPrice(price)}
        </div>
        {soldOut ? (
          <span className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-secondary px-2 text-sm font-semibold text-muted-foreground">
            <span className="font-body leading-[1.7]">
              ကုန်နေပါပြီ • Sold out
            </span>
          </span>
        ) : (
          <Link
            href={href}
            className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-messenger px-2 text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="size-4" strokeWidth={3.2} />
            <span className="font-body leading-[1.7]">မှာယူရန် • Order</span>
          </Link>
        )}
      </div>
    </article>
  )
}
