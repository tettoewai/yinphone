import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"

import { cn } from "@workspace/ui/lib/utils"

import type { CatalogCategory, CatalogProduct } from "@/components/catalog-data"
import { Link } from "@/i18n/navigation"
import { headingLeading } from "@/lib/typography"

type CategoryShowcaseProps = {
  categories: CatalogCategory[]
  products: CatalogProduct[]
}

/**
 * Image-led category cards. The photo is the first in-stock product of that
 * category, so the cards stay truthful to what the shop actually has instead of
 * relying on stock photography that would need its own licensing.
 */
export default async function CategoryShowcase({
  categories,
  products,
}: CategoryShowcaseProps) {
  const locale = await getLocale()
  const catalog = await getTranslations("Catalog")

  const leadImage = (slug: string) => {
    const inCategory = products.filter((product) => product.category === slug)

    return inCategory.find((product) => !product.soldOut) ?? inCategory[0]
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      {categories.map((category) => {
        const lead = leadImage(category.slug)

        return (
          <Link
            key={category.slug}
            href={`/catalog?category=${category.slug}`}
            className="group relative overflow-hidden rounded-lg bg-secondary"
          >
            <div className="relative aspect-[4/5]">
              {lead ? (
                <Image
                  src={lead.image}
                  alt={lead.alt}
                  fill
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : null}
            </div>

            {/* Fixed warm-brown scrim rather than a theme token: the photo is
                unknown, so the overlay has to guarantee white text on it. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2a221e]/85 via-[#2a221e]/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3
                className={cn(
                  "font-heading text-lg text-white md:text-xl",
                  headingLeading(locale, "section")
                )}
              >
                {category.name}
              </h3>
              <p className="mt-1 text-[11px] tracking-[0.14em] text-white/75 uppercase">
                {catalog("results", { count: category.productCount })}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
