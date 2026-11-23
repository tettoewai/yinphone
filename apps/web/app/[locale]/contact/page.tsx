import { MessageCircle } from "lucide-react"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import ContactAddressCard from "@/components/contact-address-card"
import { CONTACT } from "@/components/contact-data"
import ContactFaq, { type FaqItem } from "@/components/contact-faq"
import ContactHeader from "@/components/contact-header"
import ContactHours from "@/components/contact-hours"
import ContactMap from "@/components/contact-map"
import ContactQuickActions from "@/components/contact-quick-actions"
import { alternatesFor } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata.contact")

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor(locale, "/contact"),
  }
}

export default async function ContactPage() {
  const t = await getTranslations("Contact")
  const items = t.raw("faq.items") as FaqItem[]

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <ContactHeader />

      <section className="flex flex-col gap-2.5 px-4 pt-4">
        <h2 className="text-sm font-bold text-foreground">
          {t("quick.title")}
        </h2>
        <ContactQuickActions />
        <p className="text-center font-body text-xs leading-[1.7] text-muted-foreground">
          {t("quick.hint")}
        </p>
      </section>

      <section className="px-4 pt-5">
        <ContactAddressCard />
      </section>

      <section aria-label={t("map.label")} className="px-4 pt-3">
        <ContactMap />
      </section>

      <section className="flex flex-col gap-2.5 px-4 pt-5">
        <h2 className="font-heading text-base font-bold text-foreground">
          {t("hours.title")}
        </h2>
        <ContactHours />
      </section>

      <section className="flex flex-col gap-2.5 px-4 pt-5 pb-6">
        <h2 className="font-heading text-base font-bold text-foreground">
          {t("faq.title")}
        </h2>

        <ContactFaq items={items} />

        <a
          href={CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-messenger text-sm font-bold text-primary-foreground"
        >
          <MessageCircle className="size-[17px]" strokeWidth={2.82} />
          <span className="font-body">{t("askMessenger")}</span>
        </a>
      </section>
    </div>
  )
}
