"use client"

import { Heart } from "lucide-react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { useFavourites } from "@/lib/favourites"
import { formatDigits } from "@/lib/format"

type ProductGalleryProps = {
  productId: string
  images: string[]
  alt: string
  badge?: string
}

export default function ProductGallery({
  productId,
  images,
  alt,
  badge,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { isFavourite, toggle } = useFavourites()
  const favourited = isFavourite(productId)
  const locale = useLocale()
  const t = useTranslations("Common")

  const total = images.length
  const activeImage = images[activeIndex] ?? images[0]

  return (
    <section className="flex flex-col gap-0 bg-card">
      <div className="relative">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={alt}
            width={720}
            height={900}
            sizes="(min-width: 448px) 448px, 100vw"
            priority
            className="aspect-[4/5] w-full object-cover"
          />
        ) : null}

        {badge ? (
          <div className="absolute top-3 left-3 rounded-sm bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
            {badge}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={
            favourited ? t("removeFromFavourites") : t("saveToFavourites")
          }
          aria-pressed={favourited}
          onClick={() => toggle(productId)}
          className="absolute top-3 right-3 flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card/95"
        >
          <Heart
            className={cn(
              "size-[18px]",
              favourited
                ? "fill-accent-foreground text-accent-foreground"
                : "text-muted-foreground"
            )}
            strokeWidth={2.67}
          />
        </button>

        {total > 1 ? (
          <>
            <div className="absolute right-0 bottom-3 left-0 flex items-center justify-center gap-1.5">
              {images.map((image, index) => (
                <span
                  key={`${image}-${index}`}
                  className={cn(
                    "h-1.5 rounded-sm",
                    index === activeIndex ? "w-6 bg-card" : "w-1.5 bg-card/70"
                  )}
                />
              ))}
            </div>
            <div className="absolute right-3 bottom-3 rounded-sm bg-foreground/70 px-2 py-1 text-xs font-medium text-white">
              {formatDigits(activeIndex + 1, locale)} /{" "}
              {formatDigits(total, locale)}
            </div>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={t("showPhoto", { index: index + 1, total })}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2",
                index === activeIndex
                  ? "border-primary"
                  : "border-border opacity-70"
              )}
            >
              <Image
                src={image}
                alt=""
                width={128}
                height={128}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
