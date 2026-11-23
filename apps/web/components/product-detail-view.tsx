"use client"

import { Check, ChevronDown, Flame, Info, Repeat, Truck } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import CatalogCard from "@/components/catalog-card"
import { type CatalogProduct, type SizeId } from "@/components/catalog-data"
import type { ProductDetail } from "@/components/product-detail-data"
import OrderBar from "@/components/order-bar"
import ProductDetailHeader from "@/components/product-detail-header"
import ProductGallery from "@/components/product-gallery"
import SizeGuideDialog from "@/components/size-guide-dialog"
import { Link } from "@/i18n/navigation"
import { formatPrice } from "@/lib/format"

type ProductDetailViewProps = {
  detail: ProductDetail
  related: CatalogProduct[]
}

export default function ProductDetailView({
  detail,
  related,
}: ProductDetailViewProps) {
  const [selectedSize, setSelectedSize] = useState<SizeId | null>(
    detail.defaultSize ?? null
  )
  const [selectedColorId, setSelectedColorId] = useState(detail.defaultColorId)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  const locale = useLocale()
  const t = useTranslations("Product")
  const common = useTranslations("Common")

  const selectedColor = detail.colors.find(
    (color) => color.id === selectedColorId
  )
  const modelSize = selectedSize ?? detail.sizes[0]

  const orderParams = new URLSearchParams()
  if (selectedSize) orderParams.set("size", selectedSize)
  if (selectedColor) orderParams.set("color", selectedColor.id)
  const orderQuery = orderParams.toString()
  const orderHref = `/products/${detail.id}/order${
    orderQuery ? `?${orderQuery}` : ""
  }`

  return (
    <>
      <ProductDetailHeader categoryName={detail.categoryName} />

      <ProductGallery
        productId={detail.id}
        images={detail.gallery}
        alt={detail.alt}
        badge={detail.badge}
      />

      <section className="flex flex-col gap-1.5 border-b border-border bg-card px-4 pt-2 pb-4">
        <h1 className="font-body text-xl leading-[1.7] font-bold text-foreground">
          {detail.title}
        </h1>
        {selectedColor ? (
          <div className="-mt-1 text-sm text-muted-foreground">
            {selectedColor.name}
          </div>
        ) : null}

        <div className="mt-1 flex items-center gap-2">
          <div className="font-heading text-2xl font-bold text-primary">
            {formatPrice(detail.price, locale)}
          </div>
          {detail.compareAtPrice ? (
            <div className="text-sm text-muted-foreground line-through">
              {formatPrice(detail.compareAtPrice, locale)}
            </div>
          ) : null}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-sm font-semibold",
              detail.soldOut
                ? "text-muted-foreground"
                : "text-secondary-foreground"
            )}
          >
            <span
              className={cn(
                "inline-block size-2 rounded-xl",
                detail.soldOut ? "bg-muted-foreground" : "bg-primary"
              )}
            />
            <span className="font-body leading-[1.7]">
              {detail.soldOut ? common("outOfStock") : common("inStock")}
            </span>
          </div>

          {!detail.soldOut && detail.stockLeft ? (
            <div className="inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground">
              <Flame className="size-3.5" strokeWidth={3.43} />
              <span className="font-body">
                {t("stockLeft", { count: detail.stockLeft })}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {detail.sizes.length > 0 ? (
        <section className="flex flex-col gap-2.5 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-foreground">
              {t("sizeChoose")}
            </div>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="min-h-[44px] text-sm font-medium text-primary underline"
            >
              {t("sizeGuide.title")}
            </button>
          </div>

          <div className="flex gap-2">
            {detail.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={cn(
                  "flex min-h-[48px] flex-1 items-center justify-center rounded-md text-sm font-bold",
                  selectedSize === size
                    ? "border-2 border-primary bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          {modelSize ? (
            <div className="font-body text-xs leading-[1.7] text-muted-foreground">
              {t("modelWears", { size: modelSize })}
            </div>
          ) : null}
        </section>
      ) : null}

      {detail.colors.length > 0 ? (
        <section className="flex flex-col gap-2.5 px-4 pb-4">
          <div className="text-sm font-bold text-foreground">
            {t("color")}{" "}
            <span className="font-normal text-muted-foreground">
              • {selectedColor?.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {detail.colors.map((color) => {
              const isSelected = color.id === selectedColorId

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColorId(color.id)}
                  aria-pressed={isSelected}
                  className="flex w-[56px] flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex h-[44px] w-[44px] items-center justify-center rounded-xl border-2",
                      isSelected ? "border-primary" : "border-border"
                    )}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected ? (
                      <Check
                        className={cn(
                          "size-[18px]",
                          isLightSwatch(color.hex)
                            ? "text-foreground"
                            : "text-primary-foreground"
                        )}
                        strokeWidth={2.67}
                      />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isSelected
                        ? "font-bold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {color.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <div className="mx-4 flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">{t("about")}</h2>
        <p
          className={cn(
            "font-body text-sm leading-[1.8] text-foreground",
            !isDescriptionOpen && "line-clamp-3"
          )}
        >
          {detail.description}
        </p>
        <button
          type="button"
          onClick={() => setIsDescriptionOpen((value) => !value)}
          aria-expanded={isDescriptionOpen}
          className="flex items-center gap-1 self-start text-sm font-semibold text-primary"
        >
          {isDescriptionOpen ? t("readLess") : t("readMore")}
          <ChevronDown
            className={cn(
              "size-[15px] transition-transform",
              isDescriptionOpen && "rotate-180"
            )}
            strokeWidth={3.2}
          />
        </button>

        <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Truck className="size-[13px]" strokeWidth={3.69} />
            {t("cod")}
          </span>
          <span className="flex items-center gap-1">
            <Repeat className="size-[13px]" strokeWidth={3.69} />
            {t("exchange")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="flex items-start gap-2 rounded-md bg-secondary px-3 py-2.5">
          <Info
            className="mt-0.5 size-4 shrink-0 text-primary"
            strokeWidth={3}
          />
          <p className="font-body text-xs leading-[1.7] text-secondary-foreground">
            {t("orderHint")}
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="flex flex-col gap-2.5 pt-5 pb-5">
          <div className="flex items-center justify-between px-4">
            <h2 className="font-heading text-base font-bold text-foreground">
              {t("related")}
            </h2>
            <Link
              href="/catalog"
              className="text-sm font-semibold text-primary"
            >
              {common("seeAll")}
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4">
            {related.map((product) => (
              <div key={product.id} className="flex w-[160px] shrink-0">
                <CatalogCard product={product} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <OrderBar
        orderHref={orderHref}
        price={detail.price}
        soldOut={detail.soldOut}
      />

      {isSizeGuideOpen ? (
        <SizeGuideDialog
          sizes={detail.sizes}
          onClose={() => setIsSizeGuideOpen(false)}
        />
      ) : null}
    </>
  )
}

function isLightSwatch(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255

  return 0.299 * red + 0.587 * green + 0.114 * blue > 160
}
