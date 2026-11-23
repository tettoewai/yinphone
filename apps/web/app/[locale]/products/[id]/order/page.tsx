import { Lock } from "lucide-react"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { MAX_ORDER_QTY, MIN_ORDER_QTY } from "@/components/order-data"
import OrderConfirmHeader from "@/components/order-confirm-header"
import OrderSummaryCard from "@/components/order-summary-card"
import { toProductDetail } from "@/components/product-detail-data"
import { redirect } from "@/i18n/navigation"
import { fetchProduct } from "@/lib/api"
import { alternatesFor } from "@/lib/metadata"

export const dynamic = "force-dynamic"

type OrderPageProps = {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()])
  const product = await fetchProduct(id)

  if (!product) {
    const t = await getTranslations("Metadata.product")
    return { title: t("notFound") }
  }

  const t = await getTranslations("Metadata.order")
  const detail = toProductDetail(product, locale)

  return {
    title: t("title"),
    description: t("description", { name: detail.title }),
    alternates: alternatesFor(locale, `/products/${detail.id}/order`),
  }
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const [{ id }, locale] = await Promise.all([params, getLocale()])
  const query = await searchParams
  const product = await fetchProduct(id)

  if (!product) notFound()

  const detail = toProductDetail(product, locale)

  // Sold-out pieces have no order screen.
  if (detail.soldOut) redirect({ href: `/products/${detail.id}`, locale })

  const t = await getTranslations("Common")

  const requestedSize = firstValue(query.size)
  const requestedColor = firstValue(query.color)
  const requestedQty = Number.parseInt(firstValue(query.qty) ?? "", 10)

  const size =
    detail.sizes.find((entry) => entry === requestedSize) ?? detail.defaultSize
  const color =
    detail.colors.find((entry) => entry.id === requestedColor) ??
    detail.colors.find((entry) => entry.id === detail.defaultColorId) ??
    detail.colors[0]
  const maxQty = Math.max(
    MIN_ORDER_QTY,
    Math.min(MAX_ORDER_QTY, detail.stockLeft ?? MAX_ORDER_QTY)
  )
  const qty = Number.isFinite(requestedQty)
    ? Math.min(maxQty, Math.max(MIN_ORDER_QTY, requestedQty))
    : MIN_ORDER_QTY

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <OrderConfirmHeader
        productSlug={detail.id}
        title={detail.title}
        price={detail.price}
      />

      <OrderSummaryCard
        productId={detail.productId}
        productSlug={detail.id}
        image={detail.gallery[0] ?? detail.image}
        alt={detail.alt}
        title={detail.title}
        shopTitle={detail.shopTitle}
        price={detail.price}
        size={size}
        colorName={color?.name}
        colorHex={color?.hex}
        initialQty={qty}
        stockLeft={detail.stockLeft}
      />

      <div className="flex items-center justify-center gap-1.5 pt-3 pb-6 text-muted-foreground">
        <Lock className="size-3" strokeWidth={4} />
        <p className="text-xs">{t("chatOnly")}</p>
      </div>
    </div>
  )
}
