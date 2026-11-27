"use client"

import { Heart } from "lucide-react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"

import { type CatalogProduct } from "@/components/catalog-data"
import { Link } from "@/i18n/navigation"
import { useFavourites } from "@/lib/favourites"
import { formatPrice } from "@/lib/format"

type CatalogCardProps = {
  product: CatalogProduct
}

/**
 * The single product tile behind every grid — home, catalog, saved items and
 * the related rail on the product page. It carries no "Order" button on
 * purpose: the grids read as a lookbook, and the per-product CTA lives on the
 * product page's sticky order bar.
 */
export default function CatalogCard({ product }: CatalogCardProps) {
  const { id, image, alt, title, price, badge, compareAtPrice, soldOut } =
    product
  const href = `/products/${id}`
  const { isFavourite, toggle } = useFavourites()
  const favourited = isFavourite(id)
  const locale = useLocale()
  const t = useTranslations("Common")

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="relative">
        <Link href={href} aria-label={title} className="block">
          <Image
            src={image}
            alt={alt}
            width={480}
            height={640}
            sizes="(min-width: 768px) 240px, 50vw"
            className="aspect-[3/4] w-full object-cover"
          />
        </Link>

        {badge ? (
          <div className="absolute top-2 left-2 rounded-sm bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
            {badge}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => toggle(id)}
          aria-pressed={favourited}
          aria-label={
            favourited ? t("removeFromFavourites") : t("saveToFavourites")
          }
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/95"
        >
          <Heart
            className={cn(
              "size-4",
              favourited
                ? "fill-accent-foreground text-accent-foreground"
                : "text-muted-foreground"
            )}
            strokeWidth={3}
          />
        </button>

        {soldOut ? (
          <div className="absolute bottom-2 left-2 rounded-sm bg-foreground/85 px-2 py-1 font-body text-xs leading-[1.7] font-semibold text-primary-foreground">
            {t("soldOut")}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <Link
          href={href}
          className="line-clamp-2 font-body text-sm leading-[1.7] font-bold text-foreground"
        >
          {title}
        </Link>
        <div className="mt-auto flex items-baseline gap-1.5 pt-1.5">
          <span className="font-heading text-[15px] font-bold text-primary">
            {formatPrice(price, locale)}
          </span>
          {compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(compareAtPrice, locale)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
