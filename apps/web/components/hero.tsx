import { ArrowRight, MessageCircle, Sparkles } from "lucide-react"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { CONTACT } from "@/components/contact-data"
import { Link } from "@/i18n/navigation"

export default async function Hero() {
  const t = await getTranslations("Hero")

  return (
    <div className="relative">
      <Image
        src="https://i.pinimg.com/1200x/94/02/b9/9402b935c41d12fa8946855f122dab50.jpg"
        alt={t("imageAlt")}
        width={900}
        height={1125}
        sizes="(min-width: 448px) 448px, 100vw"
        priority
        className="aspect-[4/5] max-h-[520px] w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/55 via-black/10 to-transparent p-4">
        <div className="flex flex-col gap-2 rounded-lg bg-card/95 p-4 shadow-sm">
          <div className="inline-flex items-center gap-1 self-start rounded-sm bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="size-3" />
            {t("badge")}
          </div>
          <h1 className="font-body text-2xl leading-[1.7] font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="-mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-1 flex gap-2">
            <Link
              href="/catalog"
              className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-accent text-sm font-bold text-accent-foreground"
            >
              {t("shopNow")}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={CONTACT.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-messenger text-sm font-bold text-primary-foreground"
            >
              <MessageCircle className="size-4" />
              <span className="font-body">Messenger</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
