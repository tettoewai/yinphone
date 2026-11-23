"use client"

import { Heart, MessageCircle } from "lucide-react"
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

export default function CatalogCard({ product }: CatalogCardProps) {
  const { id, image, alt, title, price, compareAtPrice, soldOut } = product
  const href = `/products/${id}`
  const { isFavourite, toggle } = useFavourites()
  const favourited = isFavourite(id)
  const locale = useLocale()
  const t = useTranslations("Common")

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="relative">
        <Link href={href} aria-label={title} className="block">
          <Image
            src={image}
            alt={alt}
            width={480}
            height={480}
            sizes="(min-width: 448px) 224px, 50vw"
            className="aspect-square w-full object-cover"
          />
        </Link>
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
          <div className="absolute bottom-2 left-2 rounded-sm bg-foreground/85 px-2 py-1 font-body text-xs leading-[1.7] font-semibold text-white">
            {t("soldOut")}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-0.5 p-3",
          soldOut && "opacity-80"
        )}
      >
        <Link
          href={href}
          className="line-clamp-2 font-body text-sm leading-[1.7] font-medium text-foreground"
        >
          {title}
        </Link>
        <div className="mt-0.5 mb-1.5 flex items-baseline gap-1.5">
          <span className="font-heading text-[15px] font-bold text-primary">
            {formatPrice(price, locale)}
          </span>
          {compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(compareAtPrice, locale)}
            </span>
          ) : null}
        </div>
        {soldOut ? (
          <span className="mt-auto flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-secondary text-sm font-semibold text-muted-foreground">
            <span className="font-body leading-[1.7]">{t("soldOut")}</span>
          </span>
        ) : (
          <Link
            href={href}
            className="mt-auto flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-messenger text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="size-[15px]" strokeWidth={3.2} />
            <span className="font-body leading-[1.7]">{t("order")}</span>
          </Link>
        )}
      </div>
    </article>
  )
}
