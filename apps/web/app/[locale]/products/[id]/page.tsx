import type { Locale } from "next-intl"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { toCatalogProduct } from "@/components/catalog-data"
import {
  toProductDetail,
  type ProductDetail,
} from "@/components/product-detail-data"
import ProductDetailView from "@/components/product-detail-view"
import { fetchProduct, fetchProducts } from "@/lib/api"
import { alternatesFor } from "@/lib/metadata"

export const dynamic = "force-dynamic"

type ProductPageProps = {
  params: Promise<{ locale: string; id: string }>
}

async function loadDetail(
  slug: string,
  locale: Locale
): Promise<ProductDetail | null> {
  const product = await fetchProduct(slug)

  return product ? toProductDetail(product, locale) : null
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()])
  const detail = await loadDetail(id, locale)

  if (!detail) {
    const t = await getTranslations("Metadata.product")
    return { title: t("notFound") }
  }

  return {
    title: detail.title,
    description: detail.description || undefined,
    alternates: alternatesFor(locale, `/products/${detail.id}`),
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [{ id }, locale] = await Promise.all([params, getLocale()])
  const detail = await loadDetail(id, locale)

  if (!detail) notFound()

  // Same-category pieces fill the "you might like" rail; five is enough to
  // leave four after the current product is removed.
  const related = (await fetchProducts({ category: detail.category, limit: 5 }))
    .map((product) => toCatalogProduct(product, locale))
    .filter((product) => product.id !== detail.id)
    .slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <ProductDetailView detail={detail} related={related} />
    </div>
  )
}
