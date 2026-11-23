import { ArrowRight, Quote } from "lucide-react"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import AboutHeader from "@/components/about-header"
import AboutHero from "@/components/about-hero"
import AboutValues from "@/components/about-values"
import { Link } from "@/i18n/navigation"
import { alternatesFor } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata.about")

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/about"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("About")

  const stats = [
    {
      id: "buyers",
      value: t("stats.buyers.value", { count: 5000 }),
      label: t("stats.buyers.label"),
    },
    {
      id: "designs",
      value: t("stats.designs.value", { count: 300 }),
      label: t("stats.designs.label"),
    },
    {
      id: "rating",
      value: t("stats.rating.value", { value: 4.9 }),
      label: t("stats.rating.label"),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <AboutHeader />
      <AboutHero />

      <section className="flex flex-col gap-3 px-4 pt-4">
        <h2 className="font-body text-xl leading-[1.7] font-bold text-foreground">
          {t("heading")}
        </h2>
        <p className="font-body text-sm leading-[1.9] text-foreground">
          {t("body1")}
        </p>
        <p className="font-body text-sm leading-[1.9] text-foreground">
          {t("body2")}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-secondary">
            <Quote className="size-[13px] text-primary" strokeWidth={3.7} />
          </span>
          <span className="font-body">{t("founder")}</span>
        </div>
      </section>

      <section aria-label={t("ariaValues")} className="px-4 pt-5">
        <AboutValues />
      </section>

      <section aria-label={t("ariaStats")} className="px-4 pt-3">
        <div className="flex items-center justify-between rounded-md bg-primary px-4 py-3.5">
          {stats.map(({ id, value, label }) => (
            <div key={id} className="flex-1 text-center">
              <div className="font-heading text-lg font-bold text-primary-foreground">
                {value}
              </div>
              <div className="font-body text-xs text-primary-foreground/80">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-5 pb-6">
        <Link
          href="/catalog"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-accent text-[15px] font-bold text-accent-foreground"
        >
          {t("cta")}
          <ArrowRight className="size-[17px]" strokeWidth={2.82} />
        </Link>
        <p className="pt-2 text-center font-body text-xs leading-[1.7] text-muted-foreground">
          {t("ctaHint")}
        </p>
      </section>
    </div>
  )
}
