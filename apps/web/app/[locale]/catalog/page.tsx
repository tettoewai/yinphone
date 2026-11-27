import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { toCatalogCategory, toCatalogProduct } from "@/components/catalog-data"
import CatalogView from "@/components/catalog-view"
import { fetchCategories, fetchProducts } from "@/lib/api"
import { parseCatalogQuery } from "@/lib/catalog-query"
import { alternatesFor } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata.catalog")

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/catalog"),
  }
}

// Filters, stock and prices all come from the database.
export const dynamic = "force-dynamic"

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const locale = await getLocale()

  const [products, categories, params] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
    searchParams,
  ])

  const categoryList = categories.map((category) =>
    toCatalogCategory(category, locale)
  )
  const query = parseCatalogQuery(
    params,
    categoryList.map((category) => category.slug)
  )

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body md:max-w-3xl lg:max-w-5xl">
      <CatalogView
        products={products.map((product) => toCatalogProduct(product, locale))}
        categories={categoryList}
        initial={query}
      />
    </div>
  )
}
