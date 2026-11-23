import {
  ArrowRight,
  Home,
  Leaf,
  MessageCircle,
  SearchX,
  ShoppingBag,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { CONTACT } from "@/components/contact-data"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("NotFound")
  const common = await getTranslations("Common")

  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <Link
        href="/"
        aria-label={common("home")}
        className="flex w-fit items-center gap-1.5 px-4 pt-4"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Leaf
            className="size-[15px] text-primary-foreground"
            strokeWidth={3.2}
          />
        </div>
        <div className="font-heading text-base font-bold text-foreground">
          YinPhone
        </div>
      </Link>

      <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <div className="relative">
          <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-secondary">
            <ShoppingBag
              className="size-[56px] text-primary"
              strokeWidth={0.86}
            />
          </div>
          <div className="absolute -top-2 -right-3 rounded-md border border-border bg-card px-2.5 py-1.5 font-heading text-2xl font-bold text-foreground shadow-sm">
            404
          </div>
          <div className="absolute -bottom-2 -left-4 flex h-11 w-11 items-center justify-center rounded-md border-2 border-card bg-accent">
            <SearchX
              className="size-5 text-accent-foreground"
              strokeWidth={2.4}
            />
          </div>
        </div>

        <h1 className="pt-5 font-body text-xl leading-[1.7] font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="max-w-[280px] pt-2 font-body text-sm leading-[1.8] text-muted-foreground">
          {t("body")}
        </p>

        <div className="flex w-full flex-col gap-2 pt-5">
          <Link
            href="/"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-bold text-primary-foreground"
          >
            <Home className="size-[17px]" strokeWidth={2.82} />
            <span className="font-body">{t("home")}</span>
          </Link>
          <Link
            href="/catalog"
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-bold text-accent-foreground"
          >
            {t("browse")}
            <ArrowRight className="size-4" strokeWidth={3} />
          </Link>
        </div>

        <a
          href={CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 pt-4 text-xs text-muted-foreground hover:underline hover:underline-offset-4"
        >
          <MessageCircle
            className="size-[13px] text-primary"
            strokeWidth={3.69}
          />
          <span className="font-body">{t("help")}</span>
        </a>
      </div>
    </div>
  )
}
