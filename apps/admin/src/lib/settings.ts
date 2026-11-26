/**
 * Types, mock rows and the pure helpers behind `/settings`.
 *
 * There is no `GET/POST /api/settings` yet, so this screen runs on local state:
 * the shop profile, the team and the opening hours below stand in for what the
 * server will return. Nothing here imports React — the page and its cards own
 * the interactivity, and everything in this module can be unit-tested alone.
 *
 * Opening hours and the "open now" chip are computed in Asia/Yangon, the shop's
 * fixed UTC+6:30 zone, rather than the browser's, so the preview never disagrees
 * with the storefront.
 */

import { formatClockTime } from "@/lib/yangon-time"

/** The shop profile shown in the "Shop info" card. */
export type ShopInfo = {
  nameMy: string
  nameEn: string
  addressMy: string
  addressEn: string
  phone: string
  /** Map pin, WGS84. */
  lat: number
  lng: number
}

/** One row of the weekly schedule. `opens`/`closes` are `null` when closed. */
export type DaySchedule = {
  /** `Date#getUTCDay()` order: 0 = Sunday … 6 = Saturday. */
  weekday: number
  /** "Mon • တနင်္လာ" */
  label: string
  /** "9:00 AM", or `null` for a closed day. */
  opens: string | null
  /** "8:00 PM", or `null` for a closed day. */
  closes: string | null
}

export type TeamRole = "OWNER" | "STAFF"

/** The four cards on the screen, in the order the section strip lists them. */
export const SETTINGS_SECTIONS = [
  { key: "shop", id: "settings-shop", label: "Shop info • ဆိုင်" },
  { key: "hours", id: "settings-hours", label: "Hours • အချိန်" },
  { key: "team", id: "settings-team", label: "Team • အဖွဲ့" },
  { key: "account", id: "settings-account", label: "Account • အကောင့်" },
] as const

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["key"]

/** The `id` of the card for a section, used by the jump links and the page anchors. */
export function settingsSectionId(key: SettingsSection) {
  return (
    SETTINGS_SECTIONS.find((section) => section.key === key)?.id ??
    "settings-shop"
  )
}

export type TeamMember = {
  /** The lowercased email doubles as the row id — it is already unique. */
  id: string
  name: string
  email: string
  role: TeamRole
  /** Display string; there is no session API to derive it from yet. */
  lastLogin: string
}

/** The three account fields, kept together so the rules read one object. */
export type PasswordDraft = {
  current: string
  next: string
  confirm: string
}

export type PasswordRule = {
  id: string
  label: string
  test: (draft: PasswordDraft) => boolean
}

export const SHOP_INFO_MOCK: ShopInfo = {
  nameMy: "YinPhone Boutique • ရန်ကုန်",
  nameEn: "YinPhone Boutique Yangon",
  addressMy: "အမှတ် ၁၂၃၊ ဗိုလ်ချုပ်လမ်း၊ ရန်ကုန်",
  addressEn: "No.123 Bo Gyoke Rd, Yangon",
  phone: "09 123 456 789",
  lat: 16.84,
  lng: 96.17,
}

/** Monday-first, Sunday closed — the week the design shows. */
export const SHOP_HOURS_MOCK: readonly DaySchedule[] = [
  { weekday: 1, label: "Mon • တနင်္လာ", opens: "9:00 AM", closes: "8:00 PM" },
  { weekday: 2, label: "Tue • အင်္ဂါ", opens: "9:00 AM", closes: "8:00 PM" },
  { weekday: 3, label: "Wed • ဗုဒ္ဓဟူး", opens: "9:00 AM", closes: "8:00 PM" },
  { weekday: 4, label: "Thu • ကြာသပတေး", opens: "9:00 AM", closes: "8:00 PM" },
  { weekday: 5, label: "Fri • သောကြာ", opens: "9:00 AM", closes: "8:00 PM" },
  { weekday: 6, label: "Sat • စနေ", opens: "10:00 AM", closes: "7:00 PM" },
  { weekday: 0, label: "Sun • တနင်္ဂနွေ", opens: null, closes: null },
]

export const TEAM_MOCK: readonly TeamMember[] = [
  {
    id: "lumi@yinphone.shop",
    name: "Ma Lumi",
    email: "lumi@yinphone.shop",
    role: "OWNER",
    lastLogin: "Today 10:12 AM",
  },
  {
    id: "aye@yinphone.shop",
    name: "Aye Chan",
    email: "aye@yinphone.shop",
    role: "STAFF",
    lastLogin: "Yesterday 6:40 PM",
  },
  {
    id: "min@yinphone.shop",
    name: "Min Khant",
    email: "min@yinphone.shop",
    role: "STAFF",
    lastLogin: "18 Nov 9:02 AM",
  },
]

/** Default role in the invite panel: the owner is inviting staff, not peers. */
export const DEFAULT_INVITE_ROLE: TeamRole = "STAFF"

const YANGON_OFFSET_MS = (6 * 60 + 30) * 60_000

const CLOCK = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i

/**
 * "9:30 PM" as minutes since midnight. `null` for a closed day or a value this
 * screen did not write itself, which keeps a bad mock from opening the shop.
 */
export function parseClock(value: string | null): number | null {
  if (!value) return null

  const match = CLOCK.exec(value.trim())
  if (!match) return null

  const hour =
    (Number(match[1]) % 12) + (match[3]?.toUpperCase() === "PM" ? 12 : 0)
  return hour * 60 + Number(match[2])
}

/** Yangon's weekday and wall-clock minutes, from any instant. */
function yangonClock(date: Date) {
  const shifted = new Date(date.getTime() + YANGON_OFFSET_MS)
  return {
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  }
}

/** The next opening as "9:00 AM Mon", or `null` when no day is open. */
function nextOpening(
  hours: readonly DaySchedule[],
  weekday: number,
  minutes: number
) {
  for (let step = 0; step <= 7; step += 1) {
    const day = hours.find((row) => row.weekday === (weekday + step) % 7)
    if (!day?.opens) continue

    const opens = parseClock(day.opens)
    if (opens === null) continue
    // Earlier today's opening has already passed; the next one is tomorrow.
    if (step === 0 && opens <= minutes) continue

    return `${day.opens} ${day.label.split(" • ")[0]}`
  }

  return null
}

export type ShopOpenState = {
  isOpen: boolean
  /** "Open now • 10:42 AM" — the chip beside the Hours title. */
  chip: string
  /** The one-line note under the rows, quoting the storefront preview. */
  preview: string
}

/**
 * Whether the shop is open right now, plus the two strings the Hours card
 * shows. Reached through `hours` rather than a hardcoded "Open now", so the
 * chip stays true after Yangon passes closing time.
 */
export function shopOpenState(
  hours: readonly DaySchedule[],
  now: Date = new Date()
): ShopOpenState {
  const { weekday, minutes } = yangonClock(now)
  const today = hours.find((day) => day.weekday === weekday)
  const opens = parseClock(today?.opens ?? null)
  const closes = parseClock(today?.closes ?? null)
  const isOpen =
    opens !== null && closes !== null && minutes >= opens && minutes < closes
  const clock = formatClockTime(now)

  if (isOpen && today?.closes) {
    return {
      isOpen,
      chip: `Open now • ${clock}`,
      preview: `Preview: “Open now • closes ${today.closes}” — based on Asia/Yangon time.`,
    }
  }

  const next = nextOpening(hours, weekday, minutes)

  return {
    isOpen,
    chip: `Closed now • ${clock}`,
    preview: next
      ? `Preview: “Closed • opens ${next}” — based on Asia/Yangon time.`
      : `Preview: “Closed” — no opening hours set.`,
  }
}

/** "16.84°N 96.17°E • Yangon" — the caption under the map. */
export function formatCoordinates(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S"
  const ew = lng >= 0 ? "E" : "W"
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lng).toFixed(2)}°${ew} • Yangon`
}

/** "M" for "Ma Lumi" — the member avatar. */
export function teammateInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

/**
 * "lumi@yinphone.shop • last login Today 10:12 AM". A freshly invited row has
 * no login to report, so it drops the "last login" prefix instead of claiming
 * one that never happened.
 */
export function memberMeta(member: TeamMember) {
  const activity = member.lastLogin.startsWith("Invited")
    ? member.lastLogin
    : `last login ${member.lastLogin}`
  return `${member.email} • ${activity}`
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/**
 * "staff@yinphone.shop" → "Staff". The invite panel only collects an email, so
 * the row needs a name until the invited teammate sets their own.
 */
export function nameFromEmail(email: string) {
  const local = email.trim().split("@")[0] ?? ""
  const words = local.split(/[._-]+/).filter(Boolean)
  if (words.length === 0) return "New teammate"

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const ACCOUNT_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: "8+ characters",
    test: ({ next }) => next.length >= 8,
  },
  {
    id: "mix",
    label: "Uppercase + number",
    test: ({ next }) => /[A-Z]/.test(next) && /\d/.test(next),
  },
  {
    id: "distinct",
    label: "Different from current",
    test: ({ current, next }) => next.length > 0 && next !== current,
  },
]

export function accountPasswordRules() {
  return ACCOUNT_RULES
}

/** Why the account form cannot be submitted, or `undefined` when it can. */
export function passwordFormError(draft: PasswordDraft) {
  if (draft.current.length === 0) {
    return "Current password is required • လက်ရှိ စကားဝှက် ထည့်ပါ။"
  }
  if (ACCOUNT_RULES.some((rule) => !rule.test(draft))) {
    return "New password does not meet the rules yet • လိုအပ်ချက်များ မပြည့်သေးပါ။"
  }
  if (draft.confirm !== draft.next) {
    return "New passwords do not match • စကားဝှက် မတူပါ။"
  }

  return undefined
}

export function emptyPasswordDraft(): PasswordDraft {
  return { current: "", next: "", confirm: "" }
}

/** A fresh copy of the mock so page state never mutates the module constant. */
export function shopInfoFromMock() {
  return { ...SHOP_INFO_MOCK }
}

export function teamFromMock() {
  return TEAM_MOCK.map((member) => ({ ...member }))
}
