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
 *
 * No card chrome: the photo is the card. A 4:5 frame keeps every tile the same
 * height whatever the source image was shot at.
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
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-secondary">
        <Link href={href} aria-label={title} className="block">
          <Image
            src={image}
            alt={alt}
            width={480}
            height={600}
            sizes="(min-width: 1280px) 290px, (min-width: 768px) 30vw, 46vw"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {badge ? (
          <div className="absolute top-3 left-3 rounded-sm bg-card/95 px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
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
          className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-card/85 backdrop-blur-sm transition-colors duration-150 hover:bg-card"
        >
          <Heart
            className={cn(
              "size-4",
              favourited ? "fill-primary text-primary" : "text-foreground/70"
            )}
            strokeWidth={1.9}
          />
        </button>

        {soldOut ? (
          <div className="absolute inset-x-0 bottom-0 bg-card/90 py-2 text-center text-[10px] font-semibold tracking-[0.18em] text-foreground uppercase">
            {t("soldOut")}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3">
        <Link
          href={href}
          className="line-clamp-2 text-sm leading-[1.7] font-medium text-foreground transition-colors duration-150 group-hover:text-primary"
        >
          {title}
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm font-semibold text-foreground">
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
