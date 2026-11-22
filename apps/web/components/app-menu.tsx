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
  Tag,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

import BottomSheet from "@/components/bottom-sheet"
import { CONTACT } from "@/components/contact-data"
import { toMyanmarDigits } from "@/components/catalog-data"
import { useFavourites } from "@/lib/favourites"

type MenuLink = {
  href: string
  labelMy: string
  labelEn: string
  icon: LucideIcon
}

const LINKS: MenuLink[] = [
  { href: "/", labelMy: "ပင်မစာမျက်နှာ", labelEn: "Home", icon: Home },
  {
    href: "/catalog",
    labelMy: "ပစ္စည်းအားလုံး",
    labelEn: "Catalog",
    icon: ShoppingBag,
  },
  {
    href: "/catalog?sort=newest",
    labelMy: "အသစ်ရောက်များ",
    labelEn: "New arrivals",
    icon: Sparkles,
  },
  {
    href: "/catalog?category=sale",
    labelMy: "လျှော့ဈေး",
    labelEn: "Sale",
    icon: Tag,
  },
  {
    href: "/about",
    labelMy: "ကျွန်မတို့အကြောင်း",
    labelEn: "About",
    icon: Info,
  },
  {
    href: "/contact",
    labelMy: "ဆက်သွယ်ရန်",
    labelEn: "Contact",
    icon: MessageCircle,
  },
]

const CHANNELS = [
  {
    id: "messenger",
    label: "Messenger",
    detail: CONTACT.messengerHandle,
    href: CONTACT.messengerUrl,
    icon: MessageCircle,
    external: true,
  },
  {
    id: "viber",
    label: "Viber",
    detail: CONTACT.phoneDisplay,
    href: CONTACT.viberHref,
    icon: PhoneCall,
    external: false,
  },
  {
    id: "telegram",
    label: "Telegram",
    detail: CONTACT.telegramHandle,
    href: CONTACT.telegramUrl,
    icon: Send,
    external: true,
  },
  {
    id: "call",
    label: "ဖုန်းခေါ်ရန်",
    detail: CONTACT.phoneDisplay,
    href: CONTACT.phoneHref,
    icon: Phone,
    external: false,
  },
]

type AppMenuProps = {
  onClose: () => void
}

export default function AppMenu({ onClose }: AppMenuProps) {
  const { count, isReady } = useFavourites()

  return (
    <BottomSheet
      title="မီနူး"
      description="Menu • YinPhone Boutique Yangon"
      onClose={onClose}
    >
      <nav aria-label="Main" className="flex flex-col px-2 pb-2">
        {LINKS.map(({ href, labelMy, labelEn, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-left active:bg-secondary"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Icon className="size-[17px] text-primary" strokeWidth={2.82} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-body text-sm leading-[1.7] font-semibold text-foreground">
                {labelMy}
              </span>
              <span className="block text-xs text-muted-foreground">
                {labelEn}
              </span>
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
          <span className="min-w-0 flex-1">
            <span className="block font-body text-sm leading-[1.7] font-semibold text-foreground">
              သိမ်းထားသော ပစ္စည်းများ
            </span>
            <span className="block text-xs text-muted-foreground">
              Saved items
            </span>
          </span>
          {isReady && count > 0 ? (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-xl bg-accent px-1.5 text-xs font-bold text-accent-foreground">
              {toMyanmarDigits(count)}
            </span>
          ) : null}
        </Link>
      </nav>

      <div className="border-t border-border px-4 pt-3 pb-4">
        <div className="pb-2 text-xs font-semibold text-muted-foreground">
          ဆက်သွယ်ရန် • Chat with us
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map(({ id, label, detail, href, icon: Icon, external }) => (
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
                  {label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              </span>
            </a>
          ))}
        </div>
        <p className="pt-3 text-center text-xs text-muted-foreground">
          No payment • No login • Chat only
        </p>
      </div>
    </BottomSheet>
  )
}
