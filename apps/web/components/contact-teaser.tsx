import { MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { CONTACT } from "@/components/contact-data"

export default async function ContactTeaser() {
  const t = await getTranslations("Contact")

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-primary p-5">
      <a
        href={CONTACT.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2.5"
      >
        <MapPin className="mt-1 size-[18px] shrink-0 text-primary-foreground" />
        <div>
          <div className="font-body text-sm leading-[1.7] font-semibold text-primary-foreground">
            {t("address")}
          </div>
          <div className="mt-0.5 text-xs text-primary-foreground/80">
            {t("teaser.hours")}
          </div>
        </div>
      </a>

      <div className="flex flex-col gap-2">
        <a
          href={CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-card text-sm font-bold text-primary"
        >
          <MessageCircle className="size-[18px]" />
          <span className="font-body">{t("teaser.orderCta")}</span>
        </a>

        <div className="flex gap-2">
          <a
            href={CONTACT.viberHref}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-md bg-viber text-sm font-semibold text-white"
          >
            <Phone className="size-4" />
            Viber
          </a>
          <a
            href={CONTACT.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-md bg-telegram text-sm font-semibold text-white"
          >
            <Send className="size-4" />
            Telegram
          </a>
        </div>

        <div className="text-center font-body text-xs leading-[1.7] text-primary-foreground/70">
          {t("teaser.hint")}
        </div>
      </div>
    </div>
  )
}
