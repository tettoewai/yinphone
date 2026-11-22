import { MESSENGER_URL } from "@/components/catalog-data"

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
  addressMy: "အမှတ် ၂၄၊ ဗိုလ်ချုပ်ဈေးလမ်း၊ ပန်းဘဲတန်းမြို့နယ်၊ ရန်ကုန်",
  addressEn: "No.24, Bogyoke Market Rd, Pabedan Township, Yangon",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Bogyoke+Market+Rd%2C+Pabedan+Township%2C+Yangon",
} as const

export type OpeningHoursEntry = {
  /** `Date.getDay()` value: 0 = Sunday. */
  day: number
  my: string
  en: string
  /** Minutes after midnight. */
  open: number
  close: number
}

export const OPENING_HOURS: OpeningHoursEntry[] = [
  { day: 1, my: "တနင်္လာ", en: "Monday", open: 600, close: 1200 },
  { day: 2, my: "အင်္ဂါ", en: "Tuesday", open: 600, close: 1200 },
  { day: 3, my: "ဗုဒ္ဓဟူး", en: "Wednesday", open: 600, close: 1200 },
  { day: 4, my: "ကြာသပတေး", en: "Thursday", open: 600, close: 1200 },
  { day: 5, my: "သောကြာ", en: "Friday", open: 600, close: 1200 },
  { day: 6, my: "စနေ", en: "Saturday", open: 570, close: 1230 },
  { day: 0, my: "တနင်္ဂနွေ", en: "Sunday", open: 720, close: 1080 },
]

function toClock(minutes: number) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0")
  const mins = String(minutes % 60).padStart(2, "0")

  return `${hours}:${mins}`
}

export function formatHours(entry: OpeningHoursEntry) {
  return `${toClock(entry.open)} – ${toClock(entry.close)}`
}

export function getStoreStatus(now: Date) {
  const entry = OPENING_HOURS.find((item) => item.day === now.getDay())
  const minutes = now.getHours() * 60 + now.getMinutes()

  return {
    today: entry ?? null,
    isOpen: Boolean(entry && minutes >= entry.open && minutes < entry.close),
  }
}

export type Faq = {
  question: string
  questionEn: string
  answer: string
}

export const FAQS: Faq[] = [
  {
    question: "ဘယ်မြို့တွေကို ပို့ပေးပါသလဲ?",
    questionEn: "Which delivery areas?",
    answer:
      "ရန်ကုန်မြို့တွင်း အိမ်ရောက်ငွေချေ၊ နယ်မြို့များကို Royal Express / Ninja Van ဖြင့် ၂–၄ ရက်အတွင်း ပို့ပေးပါတယ်။",
  },
  {
    question: "လဲလှယ်လို့ရပါသလား?",
    questionEn: "Exchange policy",
    answer:
      "၇ ရက်အတွင်း အရွယ်အစား မှားယွင်းပါက လဲလှယ်နိုင်ပါတယ်။ အထည်ကို မဝတ်ရသေးဘဲ tag မဖြုတ်ထားရပါ။",
  },
  {
    question: "ငွေပေးချေမှုနည်းလမ်းများ?",
    questionEn: "Payment methods",
    answer:
      "KPay၊ WavePay၊ AYA Pay ဖြင့် လွှဲပေးနိုင်ပြီး ရန်ကုန်မြို့တွင်း အိမ်ရောက်ငွေချေလည်း ရပါတယ်။",
  },
]
