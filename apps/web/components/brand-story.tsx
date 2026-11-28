import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"

import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"
import { headingLeading } from "@/lib/typography"

type BrandStoryProps = {
  image: string
  alt: string
}

/** Two-column editorial break between the grids: photo, then the shop's story. */
export default async function BrandStory({ image, alt }: BrandStoryProps) {
  const locale = await getLocale()
  const t = await getTranslations("Home")

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8 lg:py-24">
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 540px, (min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
              {t("story.eyebrow")}
            </span>
          </div>

          <h2
            className={cn(
              "mt-5 max-w-md font-heading text-2xl text-balance text-foreground md:text-3xl lg:text-4xl",
              headingLeading(locale, "section")
            )}
          >
            {t("story.title")}
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-[1.8] text-muted-foreground md:text-base">
            {t("story.body")}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-[1.8] text-muted-foreground md:text-base">
            {t("story.body2")}
          </p>

          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm font-medium text-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
          >
            {t("story.cta")}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
