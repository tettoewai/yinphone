import type { Metadata } from "next"

import { toCatalogCategory, toCatalogProduct } from "@/components/catalog-data"
import CatalogView from "@/components/catalog-view"
import { fetchCategories, fetchProducts } from "@/lib/api"
import { parseCatalogQuery } from "@/lib/catalog-query"

export const metadata: Metadata = {
  title: "Catalog — YinPhone",
  description:
    "ရင်ဖုံးများ၊ လုံချည်များနှင့် ဂါဝန်အစုံများကို YinPhone ဆိုင်မှ Messenger ဖြင့် မှာယူနိုင်ပါတယ်။",
}

// Filters, stock and prices all come from the database.
export const dynamic = "force-dynamic"

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const [products, categories, params] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
    searchParams,
  ])

  const categoryList = categories.map(toCatalogCategory)
  const query = parseCatalogQuery(
    params,
    categoryList.map((category) => category.slug)
  )

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <CatalogView
        products={products.map(toCatalogProduct)}
        categories={categoryList}
        initial={query}
      />
    </div>
  )
}
