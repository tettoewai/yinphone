import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"

import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"
import { headingLeading } from "@/lib/typography"

type CollectionBannerProps = {
  image: string
  alt: string
}

/**
 * Full-width campaign band. The image is one of the shop's own photos, so the
 * section can never ship with a placeholder if the catalogue is populated.
 */
export default async function CollectionBanner({
  image,
  alt,
}: CollectionBannerProps) {
  const locale = await getLocale()
  const t = await getTranslations("Home")

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Left-weighted scrim: the copy sits in the darkest part of the band. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#211a17]/90 via-[#211a17]/60 to-[#211a17]/15" />

      <div className="mx-auto flex min-h-[420px] w-full max-w-7xl items-center px-4 py-16 md:min-h-[520px] md:px-6 lg:px-8">
        <div className="max-w-md">
          <div className="text-[11px] font-semibold tracking-[0.24em] text-white/70 uppercase">
            {t("featured.eyebrow")}
          </div>

          <h2
            className={cn(
              "mt-5 font-heading text-3xl text-balance text-white md:text-4xl",
              headingLeading(locale, "section")
            )}
          >
            {t("featured.title")}
          </h2>

          <p className="mt-5 text-sm leading-[1.8] text-white/80 md:text-base">
            {t("featured.body")}
          </p>

          <Link
            href="/catalog"
            className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-background px-6 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-background/90"
          >
            {t("featured.cta")}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
