"use client"

import { Heart, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

import { formatPrice, type CatalogProduct } from "@/components/catalog-data"
import { useFavourites } from "@/lib/favourites"

type CatalogCardProps = {
  product: CatalogProduct
}

export default function CatalogCard({ product }: CatalogCardProps) {
  const { id, image, alt, title, subtitle, price, compareAtPrice, soldOut } =
    product
  const href = `/products/${id}`
  const { isFavourite, toggle } = useFavourites()
  const favourited = isFavourite(id)

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
            favourited ? "Remove from favourites" : "Save to favourites"
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
            ကုန်နေပါပြီ • Out of stock
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
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-heading text-[15px] font-bold text-primary">
            {formatPrice(price)}
          </span>
          {compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>
        {soldOut ? (
          <span className="mt-1.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-secondary text-sm font-semibold text-muted-foreground">
            <span className="font-body leading-[1.7]">
              ကုန်နေပါပြီ • Sold out
            </span>
          </span>
        ) : (
          <Link
            href={href}
            className="mt-1.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-messenger text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="size-[15px]" strokeWidth={3.2} />
            <span className="font-body leading-[1.7]">မှာယူရန် • Order</span>
          </Link>
        )}
      </div>
    </article>
  )
}
