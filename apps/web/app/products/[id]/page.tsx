import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { toCatalogProduct } from "@/components/catalog-data"
import {
  toProductDetail,
  type ProductDetail,
} from "@/components/product-detail-data"
import ProductDetailView from "@/components/product-detail-view"
import { fetchProduct, fetchProducts } from "@/lib/api"

export const dynamic = "force-dynamic"

type ProductPageProps = {
  // The route segment carries the product slug.
  params: Promise<{ id: string }>
}

async function loadDetail(slug: string): Promise<ProductDetail | null> {
  const product = await fetchProduct(slug)

  return product ? toProductDetail(product) : null
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const detail = await loadDetail(id)

  if (!detail) {
    return { title: "ပစ္စည်း မတွေ့ပါ — YinPhone" }
  }

  return {
    title: `${detail.subtitle} — YinPhone`,
    description: detail.description || undefined,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const detail = await loadDetail(id)

  if (!detail) notFound()

  // Same-category pieces fill the "you might like" rail; five is enough to
  // leave four after the current product is removed.
  const related = (await fetchProducts({ category: detail.category, limit: 5 }))
    .map(toCatalogProduct)
    .filter((product) => product.id !== detail.id)
    .slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <ProductDetailView detail={detail} related={related} />
    </div>
  )
}
