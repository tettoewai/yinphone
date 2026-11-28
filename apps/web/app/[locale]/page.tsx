import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { cn } from "@workspace/ui/lib/utils"

import AnnouncementBar from "@/components/announcement-bar"
import AppHeader from "@/components/app-header"
import BrandStory from "@/components/brand-story"
import CatalogCard from "@/components/catalog-card"
import CategoryShowcase from "@/components/category-showcase"
import CollectionBanner from "@/components/collection-banner"
import ContactTeaser from "@/components/contact-teaser"
import Hero from "@/components/hero"
import TrustStrip from "@/components/trust-strip"
import {
  pickFeatured,
  toCatalogCategory,
  toCatalogProduct,
} from "@/components/catalog-data"
import { Link } from "@/i18n/navigation"
import { fetchCategories, fetchProducts } from "@/lib/api"
import { alternatesFor } from "@/lib/metadata"
import { headingLeading } from "@/lib/typography"

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

/** Homepage grids: the curated arrivals, then the rest of the catalogue. */
const GRID_SIZE = 4

export default async function Page() {
  const locale = await getLocale()
  const t = await getTranslations("Home")

  const [products, categories] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchCategories(),
  ])

  const catalog = products.map((product) => toCatalogProduct(product, locale))
  const featured = pickFeatured(catalog)
  const featuredIds = new Set(featured.map((product) => product.id))
  const more = catalog
    .filter((product) => !featuredIds.has(product.id))
    .slice(0, GRID_SIZE)
  const categoryList = categories.map((category) =>
    toCatalogCategory(category, locale)
  )

  // Campaign photography reuses catalogue photos rather than shipping new
  // assets: the bands can only ever show pieces the shop really sells.
  const bannerImage = featured[1] ?? more[0] ?? featured[0]
  const storyImage = featured[2] ?? featured[0] ?? more[0]

  return (
    <div className="flex w-full flex-1 flex-col bg-background font-body">
      <AnnouncementBar />
      <AppHeader />
      <Hero />

      {featured.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <h2
              className={cn(
                "font-heading text-2xl text-foreground md:text-3xl",
                headingLeading(locale, "section")
              )}
            >
              {t("newArrivals")}
            </h2>
            <Link
              href="/catalog?sort=newest"
              className="shrink-0 pb-1 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {featured.map((product) => (
              <CatalogCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {categoryList.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-6 md:pb-16 lg:px-8 lg:pb-20">
          <div className="flex items-end justify-between gap-4">
            <h2
              className={cn(
                "font-heading text-2xl text-foreground md:text-3xl",
                headingLeading(locale, "section")
              )}
            >
              {t("shopByCategory")}
            </h2>
            <Link
              href="/catalog"
              className="shrink-0 pb-1 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="mt-7">
            <CategoryShowcase categories={categoryList} products={catalog} />
          </div>
        </section>
      ) : null}

      {bannerImage ? (
        <CollectionBanner image={bannerImage.image} alt={bannerImage.alt} />
      ) : null}

      {more.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <h2
              className={cn(
                "font-heading text-2xl text-foreground md:text-3xl",
                headingLeading(locale, "section")
              )}
            >
              {t("more.title")}
            </h2>
            <Link
              href="/catalog"
              className="shrink-0 pb-1 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {more.map((product) => (
              <CatalogCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {storyImage ? (
        <BrandStory image={storyImage.image} alt={storyImage.alt} />
      ) : null}

      <div className="pb-4">
        <TrustStrip />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-16 md:px-6 md:pt-12 md:pb-20 lg:px-8">
        <ContactTeaser />
      </div>
    </div>
  )
}
