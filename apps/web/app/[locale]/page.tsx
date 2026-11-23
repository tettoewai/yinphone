import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import AppHeader from "@/components/app-header"
import ContactTeaser from "@/components/contact-teaser"
import Hero from "@/components/hero"
import ProductCard from "@/components/product-card"
import QuickCategories from "@/components/quick-categories"
import TrustStrip from "@/components/trust-strip"
import {
  pickFeatured,
  toCatalogCategory,
  toCatalogProduct,
} from "@/components/catalog-data"
import { Link } from "@/i18n/navigation"
import { fetchCategories, fetchProducts } from "@/lib/api"
import { alternatesFor } from "@/lib/metadata"

// The catalogue is the source of truth for prices and stock, so the page is
// rendered per request rather than baked in at build time.
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata.home")

  return {
    title: { absolute: t("title") },
    description: t("description"),
    alternates: alternatesFor(locale, "/"),
  }
}

export default async function Page() {
  const locale = await getLocale()
  const t = await getTranslations("Home")

  const [products, categories] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
  ])

  const featured = pickFeatured(
    products.map((product) => toCatalogProduct(product, locale))
  )

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <AppHeader />
      <Hero />

      <section className="flex flex-col gap-2.5 pt-5">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            {t("shopByCategory")}
          </h2>
          <Link href="/catalog" className="text-sm font-semibold text-primary">
            {t("viewAll")}
          </Link>
        </div>
        <QuickCategories
          categories={categories.map((category) =>
            toCatalogCategory(category, locale)
          )}
        />
      </section>

      <section className="flex flex-col gap-3 pt-6">
        <div className="flex items-end justify-between px-4">
          <h2 className="font-body text-2xl leading-[1.7] font-bold text-foreground">
            {t("newArrivals")}
          </h2>
          <Link
            href="/catalog?sort=newest"
            className="shrink-0 pb-1 text-sm font-semibold text-primary"
          >
            {t("viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="px-4">
          <Link
            href="/catalog?sort=newest"
            className="flex min-h-[44px] w-full items-center justify-center rounded-md border border-border bg-card text-sm font-semibold text-primary"
          >
            {t("viewAllNew")}
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-2.5 pt-6">
        <h2 className="px-4 font-heading text-base font-bold text-foreground">
          {t("whyShop")}
        </h2>
        <div className="px-4">
          <TrustStrip />
        </div>
      </section>

      <section className="pt-6 pb-6">
        <div className="px-4">
          <ContactTeaser />
        </div>
      </section>
    </div>
  )
}
