import { Layers, Shirt, Sparkles, Store, type LucideIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import type { CatalogCategory } from "@/components/catalog-data"
import { Link } from "@/i18n/navigation"

/** Icon per category slug; unknown slugs fall back to a generic shop icon. */
const ICONS: Record<string, LucideIcon> = {
  blouses: Shirt,
  longyi: Layers,
  "dresses-sets": Sparkles,
}

type QuickCategoriesProps = {
  categories: CatalogCategory[]
}

export default async function QuickCategories({
  categories,
}: QuickCategoriesProps) {
  const t = await getTranslations("Catalog")

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-1 md:flex-wrap md:overflow-visible md:px-6">
      <Link
        href="/catalog"
        className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
      >
        <div className="flex h-[64px] w-[64px] items-center justify-center rounded-xl border border-border bg-card">
          <Store className="size-[22px] text-primary" />
        </div>
        <div className="text-center leading-tight">
          <div className="font-body text-xs font-semibold text-foreground">
            {t("all")}
          </div>
        </div>
      </Link>

      {categories.map((category) => {
        const Icon = ICONS[category.slug] ?? Store

        return (
          <Link
            key={category.slug}
            href={`/catalog?category=${category.slug}`}
            className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-xl border border-border bg-card">
              <Icon className="size-[22px] text-primary" />
            </div>
            <div className="text-center leading-tight">
              <div className="font-body text-xs font-semibold text-foreground">
                {category.name}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
