import type { Metadata } from "next"

import { PRODUCTS } from "@/components/catalog-data"
import CatalogView from "@/components/catalog-view"
import { parseCatalogQuery } from "@/lib/catalog-query"

export const metadata: Metadata = {
  title: "Catalog — YinPhone",
  description:
    "ဂါဝန်များ၊ အင်္ကျီများနှင့် အိတ်များကို YinPhone ဆိုင်မှ Messenger ဖြင့် မှာယူနိုင်ပါတယ်။",
}

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const query = parseCatalogQuery(await searchParams)

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <CatalogView products={PRODUCTS} initial={query} />
    </div>
  )
}
