import { ArrowRight, MessageCircle } from "lucide-react"
import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"

import { cn } from "@workspace/ui/lib/utils"

import { CONTACT } from "@/components/contact-data"
import { Link } from "@/i18n/navigation"
import { headingLeading } from "@/lib/typography"

/**
 * Home hero: an editorial split rather than a full-bleed overlay. Keeping the
 * copy on ivory means the headline sits on a measured background at every
 * breakpoint, instead of depending on whatever the photograph happens to be
 * behind it.
 */
export default async function Hero() {
  const t = await getTranslations("Hero")
  const locale = await getLocale()

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-7xl md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col justify-center px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
              {t("badge")}
            </span>
          </div>

          <h1
            className={cn(
              "mt-6 max-w-lg font-heading text-[2.15rem] font-normal tracking-[-0.01em] text-balance text-foreground md:text-5xl lg:text-[3.5rem]",
              headingLeading(locale, "display")
            )}
          >
            {t("title")}
          </h1>

          <p className="mt-6 max-w-md text-sm leading-[1.8] text-pretty text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/catalog"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
            >
              {t("shopNow")}
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>

            <a
              href={CONTACT.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm font-medium text-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
            >
              <MessageCircle className="size-4" strokeWidth={2} />
              Messenger
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-taupe" />
            <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              {t("brandLine")}
            </span>
          </div>
        </div>

        <div className="relative min-h-[380px] md:min-h-[560px] lg:min-h-[660px]">
          <Image
            src="https://i.pinimg.com/1200x/94/02/b9/9402b935c41d12fa8946855f122dab50.jpg"
            alt={t("imageAlt")}
            fill
            priority
            sizes="(min-width: 1280px) 56vw, (min-width: 768px) 58vw, 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}
