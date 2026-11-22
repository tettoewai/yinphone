"use client"

import { Heart } from "lucide-react"
import Link from "next/link"

import CatalogCard from "@/components/catalog-card"
import CatalogHeader from "@/components/catalog-header"
import {
  getProductsByIds,
  toMyanmarDigits,
} from "@/components/catalog-data"
import { useFavourites } from "@/lib/favourites"

export default function SavedView() {
  const { ids, isReady, clear } = useFavourites()
  const saved = getProductsByIds(ids)

  if (!isReady) {
    return (
      <>
        <CatalogHeader title="သိမ်းထားသော" subtitle="Saved items" />
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-md border border-border bg-secondary"
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <CatalogHeader
        title="သိမ်းထားသော ပစ္စည်းများ"
        subtitle={`Saved items • ${toMyanmarDigits(saved.length)}`}
      />

      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
            <Heart
              className="size-[34px] text-primary"
              strokeWidth={1.6}
            />
          </div>
          <div className="font-body text-base leading-[1.7] font-semibold text-foreground">
            သိမ်းထားသော ပစ္စည်း မရှိသေးပါ
          </div>
          <div className="-mt-2 text-sm text-muted-foreground">
            No saved items yet
          </div>
          <p className="max-w-[280px] font-body text-sm leading-[1.8] text-muted-foreground">
            ကြိုက်နှစ်သက်သော အထည်ပေါ်ရှိ နှလုံးသင်္ကေတကို နှိပ်ပြီး
            သိမ်းထားနိုင်ပါတယ်။
          </p>
          <Link
            href="/catalog"
            className="mt-1 flex min-h-[48px] items-center justify-center rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground"
          >
            Browse collection
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {saved.length}
              </span>{" "}
              မျိုး • saved
            </div>
            <button
              type="button"
              onClick={clear}
              className="min-h-[44px] text-sm font-semibold text-primary"
            >
              အားလုံး ဖယ်ရှားမည်
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            {saved.map((product) => (
              <CatalogCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
