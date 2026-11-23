import type { Metadata } from "next"

import { toCatalogProduct } from "@/components/catalog-data"
import SavedView from "@/components/saved-view"
import { fetchProducts } from "@/lib/api"

export const metadata: Metadata = {
  title: "Saved items — YinPhone",
  description:
    "YinPhone တွင် သိမ်းထားသော အထည်များ — မှာယူရန် ပြန်ဖွင့်ကြည့်နိုင်ပါတယ်။",
}

// Saved ids live on the device; the products they point at do not.
export const dynamic = "force-dynamic"

export default async function SavedPage() {
  const products = (await fetchProducts({ limit: 100 })).map(toCatalogProduct)

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <SavedView products={products} />
    </div>
  )
}
