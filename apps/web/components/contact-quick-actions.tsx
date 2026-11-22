import {
  MessageCircle,
  Phone,
  PhoneCall,
  Send,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { CONTACT } from "@/components/contact-data"

type Channel = {
  id: string
  icon: LucideIcon
  label: string
  detail: string
  href: string
  /** Solid button background plus an icon-tile background that reads on it. */
  className: string
  tileClassName: string
  external: boolean
}

const CHANNELS: Channel[] = [
  {
    id: "phone",
    icon: Phone,
    label: "ဖုန်းခေါ်ရန်",
    detail: `Call shop • ${CONTACT.phoneDisplay}`,
    href: CONTACT.phoneHref,
    className: "bg-primary text-primary-foreground",
    tileClassName: "bg-primary-foreground/20",
    external: false,
  },
  {
    id: "messenger",
    icon: MessageCircle,
    label: "Messenger",
    detail: `Fast reply • ${CONTACT.messengerHandle}`,
    href: CONTACT.messengerUrl,
    className: "bg-messenger text-primary-foreground",
    tileClassName: "bg-primary-foreground/20",
    external: true,
  },
  {
    id: "viber",
    icon: PhoneCall,
    label: "Viber",
    detail: `Chat & call • ${CONTACT.phoneDisplay}`,
    href: CONTACT.viberHref,
    className: "bg-viber text-white",
    tileClassName: "bg-white/20",
    external: false,
  },
  {
    id: "telegram",
    icon: Send,
    label: "Telegram",
    detail: `Send photos • ${CONTACT.telegramHandle}`,
    href: CONTACT.telegramUrl,
    className: "bg-telegram text-white",
    tileClassName: "bg-white/20",
    external: true,
  },
]

export default function ContactQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CHANNELS.map(
        ({
          id,
          icon: Icon,
          label,
          detail,
          href,
          className,
          tileClassName,
          external,
        }) => (
          <a
            key={id}
            href={href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={cn(
              "flex min-h-[110px] flex-col items-start gap-1.5 rounded-md p-3.5 text-left transition-opacity active:opacity-80",
              className
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md",
                tileClassName
              )}
            >
              <Icon className="size-[19px]" strokeWidth={2.53} />
            </span>
            <span className="font-body text-sm leading-[1.5] font-bold">
              {label}
            </span>
            <span className="-mt-1 text-xs leading-[1.5] opacity-80">
              {detail}
            </span>
          </a>
        )
      )}
    </div>
  )
}
