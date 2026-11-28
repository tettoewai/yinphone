import { MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { CONTACT } from "@/components/contact-data"

/**
 * The closing band: where the shop is, and the three channels an order can
 * actually be placed through. Sand rather than burgundy — the brand colour is
 * reserved for the single primary action.
 */
export default async function ContactTeaser() {
  const t = await getTranslations("Contact")

  return (
    <div className="rounded-lg bg-secondary p-6 md:p-8">
      <div className="grid gap-7 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-12">
        <div>
          <a
            href={CONTACT.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5"
          >
            <MapPin
              className="mt-0.5 size-[18px] shrink-0 text-primary"
              strokeWidth={1.8}
            />
            <span>
              <span className="block text-sm leading-[1.7] font-semibold text-secondary-foreground">
                {t("address")}
              </span>
              <span className="mt-1 block text-xs leading-[1.7] text-muted-foreground">
                {t("teaser.hours")}
              </span>
            </span>
          </a>

          <p className="mt-4 text-xs leading-[1.7] text-muted-foreground">
            {t("teaser.hint")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={CONTACT.messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
          >
            <MessageCircle className="size-[18px]" strokeWidth={2} />
            <span>{t("teaser.orderCta")}</span>
          </a>

          <div className="flex gap-2">
            <a
              href={CONTACT.viberHref}
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-card text-sm font-medium text-foreground transition-colors duration-150 hover:bg-card/80"
            >
              <Phone className="size-4 text-viber" strokeWidth={2} />
              Viber
            </a>
            <a
              href={CONTACT.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-card text-sm font-medium text-foreground transition-colors duration-150 hover:bg-card/80"
            >
              <Send className="size-4 text-telegram" strokeWidth={2} />
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
