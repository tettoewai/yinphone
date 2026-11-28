import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { toCatalogProduct } from "@/components/catalog-data"
import SavedView from "@/components/saved-view"
import { fetchProducts } from "@/lib/api"
import { alternatesFor } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata.saved")

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/saved"),
  }
}

// Saved ids live on the device; the products they point at do not.
export const dynamic = "force-dynamic"

export default async function SavedPage() {
  const locale = await getLocale()
  const products = (await fetchProducts({ limit: 100 })).map((product) =>
    toCatalogProduct(product, locale)
  )

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body md:max-w-3xl lg:max-w-7xl">
      <SavedView products={products} />
    </div>
  )
}
