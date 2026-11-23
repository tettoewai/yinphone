"use client"

import {
  Heart,
  Home,
  Info,
  MessageCircle,
  Phone,
  PhoneCall,
  Send,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import BottomSheet from "@/components/bottom-sheet"
import { CONTACT } from "@/components/contact-data"
import LocaleSwitcher from "@/components/locale-switcher"
import { Link } from "@/i18n/navigation"
import { useFavourites } from "@/lib/favourites"
import { formatDigits } from "@/lib/format"

type MenuLink = {
  href: string
  labelKey: "home" | "catalog" | "newArrivals" | "about" | "contact"
  icon: LucideIcon
}

const LINKS: MenuLink[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/catalog", labelKey: "catalog", icon: ShoppingBag },
  { href: "/catalog?sort=newest", labelKey: "newArrivals", icon: Sparkles },
  { href: "/about", labelKey: "about", icon: Info },
  { href: "/contact", labelKey: "contact", icon: MessageCircle },
]

const CHANNELS = [
  {
    id: "messenger",
    labelKey: "channels.messenger",
    detail: CONTACT.messengerHandle,
    href: CONTACT.messengerUrl,
    icon: MessageCircle,
    external: true,
  },
  {
    id: "viber",
    labelKey: "channels.viber",
    detail: CONTACT.phoneDisplay,
    href: CONTACT.viberHref,
    icon: PhoneCall,
    external: false,
  },
  {
    id: "telegram",
    labelKey: "channels.telegram",
    detail: CONTACT.telegramHandle,
    href: CONTACT.telegramUrl,
    icon: Send,
    external: true,
  },
  {
    id: "call",
    labelKey: "channels.call",
    detail: CONTACT.phoneDisplay,
    href: CONTACT.phoneHref,
    icon: Phone,
    external: false,
  },
] as const

type AppMenuProps = {
  onClose: () => void
}

export default function AppMenu({ onClose }: AppMenuProps) {
  const { count, isReady } = useFavourites()
  const locale = useLocale()
  const t = useTranslations("Nav")
  const contact = useTranslations("Contact")
  const common = useTranslations("Common")

  return (
    <BottomSheet
      title={t("menu")}
      description={t("menuDescription")}
      onClose={onClose}
    >
      <nav aria-label="Main" className="flex flex-col px-2 pb-2">
        {LINKS.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-left active:bg-secondary"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Icon className="size-[17px] text-primary" strokeWidth={2.82} />
            </span>
            <span className="min-w-0 flex-1 font-body text-sm leading-[1.7] font-semibold text-foreground">
              {t(labelKey)}
            </span>
          </Link>
        ))}

        <Link
          href="/saved"
          onClick={onClose}
          className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-left active:bg-secondary"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
            <Heart className="size-[17px] text-primary" strokeWidth={2.82} />
          </span>
          <span className="min-w-0 flex-1 font-body text-sm leading-[1.7] font-semibold text-foreground">
            {t("saved")}
          </span>
          {isReady && count > 0 ? (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-xl bg-accent px-1.5 text-xs font-bold text-accent-foreground">
              {formatDigits(count, locale)}
            </span>
          ) : null}
        </Link>
      </nav>

      <LocaleSwitcher />

      <div className="border-t border-border px-4 pt-3 pb-4">
        <div className="pb-2 text-xs font-semibold text-muted-foreground">
          {t("chatWithUs")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map(
            ({ id, labelKey, detail, href, icon: Icon, external }) => {
              return (
                <a
                  key={id}
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex min-h-[52px] items-center gap-2 rounded-md border border-border bg-card px-3"
                >
                  <Icon
                    className="size-4 shrink-0 text-primary"
                    strokeWidth={2.82}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {contact(labelKey)}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {detail}
                    </span>
                  </span>
                </a>
              )
            }
          )}
        </div>
        <p className="pt-3 text-center text-xs text-muted-foreground">
          {common("chatOnly")}
        </p>
      </div>
    </BottomSheet>
  )
}
