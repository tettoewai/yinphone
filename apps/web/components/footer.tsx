"use client"

import { useTranslations } from "next-intl"

import { BrandMark } from "@workspace/ui/components/brand-mark"

import { CONTACT } from "@/components/contact-data"
import { Link, usePathname } from "@/i18n/navigation"

/**
 * Storefront footer: brand, the two link columns that matter, and the chat
 * channels an order actually goes through. The year is rendered client-side so
 * a statically cached page never shows a stale one.
 */
export default function Footer() {
  const pathname = usePathname()
  const t = useTranslations("Nav")
  const home = useTranslations("Home")
  const footer = useTranslations("Footer")
  const contact = useTranslations("Contact")

  // Product and order screens are focused, modal-like flows.
  if (pathname?.startsWith("/products")) return null

  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr] md:gap-12">
          <div>
            <Link href="/" className="flex items-baseline gap-2">
              <BrandMark className="h-[14px] w-[19px] shrink-0 text-primary" />
              <span className="font-heading text-xl leading-none text-foreground">
                YinPhone
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-[1.8] text-muted-foreground">
              {home("footerTagline")}
            </p>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {footer("shop")}
            </h2>
            <nav className="mt-4 flex flex-col gap-3">
              <Link
                href="/catalog?sort=newest"
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {t("newArrivals")}
              </Link>
              <Link
                href="/catalog"
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {t("catalog")}
              </Link>
              <Link
                href="/saved"
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {t("savedShort")}
              </Link>
              <Link
                href="/about"
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {t("about")}
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {footer("chat")}
            </h2>
            <nav className="mt-4 flex flex-col gap-3">
              <a
                href={CONTACT.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {contact("channels.messenger")}
              </a>
              <a
                href={CONTACT.viberHref}
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {contact("channels.viber")}
              </a>
              <a
                href={CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm text-foreground transition-colors duration-150 hover:text-primary"
              >
                {contact("channels.telegram")}
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            © {year} {footer("rights")}
          </span>
          <span>{footer("location")}</span>
        </div>
      </div>
    </footer>
  )
}
