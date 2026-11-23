import type { Locale } from "next-intl"

import { MESSENGER_URL } from "@/components/catalog-data"
import { localizeDigits } from "@/lib/format"

const PHONE_NUMBER = "+959123456789"
const TELEGRAM_HANDLE = "yinphoneboutique"

export const CONTACT = {
  shopName: "YinPhone Boutique",
  phoneDisplay: "09 123 456 789",
  phoneHref: `tel:${PHONE_NUMBER}`,
  viberHref: `viber://chat?number=${encodeURIComponent(PHONE_NUMBER)}`,
  messengerUrl: MESSENGER_URL,
  messengerHandle: "m.me/yinphoneboutique",
  telegramUrl: `https://t.me/${TELEGRAM_HANDLE}`,
  telegramHandle: `@${TELEGRAM_HANDLE}`,
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Bogyoke+Market+Rd%2C+Pabedan+Township%2C+Yangon",
} as const

export type OpeningHoursEntry = {
  /** `Date.getDay()` value: 0 = Sunday. */
  day: number
  /** Minutes after midnight. */
  open: number
  close: number
}

export const OPENING_HOURS: OpeningHoursEntry[] = [
  { day: 1, open: 600, close: 1200 },
  { day: 2, open: 600, close: 1200 },
  { day: 3, open: 600, close: 1200 },
  { day: 4, open: 600, close: 1200 },
  { day: 5, open: 600, close: 1200 },
  { day: 6, open: 570, close: 1230 },
  { day: 0, open: 720, close: 1080 },
]

function toClock(minutes: number) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0")
  const mins = String(minutes % 60).padStart(2, "0")

  return `${hours}:${mins}`
}

export function formatHours(entry: OpeningHoursEntry, locale: Locale) {
  const open = localizeDigits(toClock(entry.open), locale)
  const close = localizeDigits(toClock(entry.close), locale)

  return `${open} – ${close}`
}

export function getStoreStatus(now: Date) {
  const entry = OPENING_HOURS.find((item) => item.day === now.getDay())
  const minutes = now.getHours() * 60 + now.getMinutes()

  return {
    today: entry ?? null,
    isOpen: Boolean(entry && minutes >= entry.open && minutes < entry.close),
  }
}
