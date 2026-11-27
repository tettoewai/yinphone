import { ArrowRight, MessageCircle, Sparkles } from "lucide-react"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { CONTACT } from "@/components/contact-data"
import { Link } from "@/i18n/navigation"

export default async function Hero() {
  const t = await getTranslations("Hero")

  return (
    <section className="overflow-hidden bg-background">
      {/* `grid` applies at every breakpoint so the `order-*` classes also
          reflow on mobile, where the single column puts the photo first. */}
      <div className="mx-auto grid md:min-h-[580px] md:grid-cols-2">
        {/* Editorial content */}
        <div className="order-2 flex flex-col justify-center px-4 py-8 md:order-1 md:px-6 md:py-10 lg:py-14">
          <div className="mb-5 inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            <Sparkles className="size-4 text-brand-gold" />
            {t("badge")}
          </div>

          <h1 className="font-heading text-3xl leading-[1.5] font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-[1.4]">
            {t("title")}
          </h1>

          <p className="mt-5 max-w-md font-body text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("shopNow")}
              <ArrowRight className="size-4" />
            </Link>

            <a
              href={CONTACT.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <MessageCircle className="size-4" />
              Messenger
            </a>
          </div>

          {/* Brand detail */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px w-10 bg-brand-gold" />
            <span className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
              {t("brandLine")}
            </span>
          </div>
        </div>

        {/* Fashion photography */}
        <div className="relative order-1 min-h-[360px] overflow-hidden md:order-2 md:min-h-[580px]">
          <Image
            src="https://i.pinimg.com/1200x/94/02/b9/9402b935c41d12fa8946855f122dab50.jpg"
            alt={t("imageAlt")}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
          />

          {/* Subtle image detail */}
          <div className="pointer-events-none absolute inset-0 border-[10px] border-background/10 md:border-[16px]" />
        </div>
      </div>
    </section>
  )
}
