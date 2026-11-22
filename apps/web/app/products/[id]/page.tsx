import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PRODUCTS } from "@/components/catalog-data"
import {
  getProductDetail,
  getRelatedProducts,
} from "@/components/product-detail-data"
import ProductDetailView from "@/components/product-detail-view"

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const detail = getProductDetail(id)

  if (!detail) {
    return { title: "ပစ္စည်း မတွေ့ပါ — YinPhone" }
  }

  return {
    title: `${detail.subtitle} — YinPhone`,
    description: detail.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = getProductDetail(id)

  if (!detail) notFound()

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <ProductDetailView detail={detail} related={getRelatedProducts(detail)} />
    </div>
  )
}
