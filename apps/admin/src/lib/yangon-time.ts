/**
 * Yangon-time strings for the admin screens.
 *
 * The shop runs on Asia/Yangon (UTC+6:30, no daylight saving), so dates are
 * always rendered in that zone rather than the browser's. The formatters are
 * built once at module scope because constructing one per render is expensive.
 */

const TIME_ZONE = "Asia/Yangon"

const MS_PER_DAY = 86_400_000

/** Asia/Yangon sits at UTC+6:30 all year — it has never observed DST. */
const YANGON_OFFSET_MS = (6 * 60 + 30) * 60_000

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
})

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
})

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
})

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
})

/** "19 Nov" — the day half of the orders table's Created column. */
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
})

/** "19 Nov 2026" — the date half of the order-detail meta line. */
const dayMonthYearFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
})

/**
 * Joins the parts with single spaces instead of the locale's literals, which
 * drop the commas `en-GB` inserts: "Thu 19 Nov 2026", not "Thu, 19 Nov 2026".
 */
function joinParts(formatter: Intl.DateTimeFormat, date: Date) {
  return formatter
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => part.value)
    .join(" ")
}

/**
 * The instant Asia/Yangon's calendar day containing `date` began. Shifting into
 * wall-clock time and flooring to a day boundary only works because the zone has
 * a fixed offset.
 */
export function startOfYangonDay(date: Date) {
  const shifted = date.getTime() + YANGON_OFFSET_MS
  return new Date(
    Math.floor(shifted / MS_PER_DAY) * MS_PER_DAY - YANGON_OFFSET_MS
  )
}

/** Yangon midnight `days` days before `from`; `0` is today's midnight. */
export function yangonDaysAgo(days: number, from: Date) {
  return new Date(startOfYangonDay(from).getTime() - days * MS_PER_DAY)
}

/** `Date` for a value that may arrive as an ISO string; `null` if unusable. */
function toDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? null : date
}

/** "19 Nov, 10:24 AM" — the orders table's Created column. */
export function formatOrderTimestamp(value: string | Date) {
  const date = toDate(value)
  if (!date) return "—"

  return `${dayMonthFormatter.format(date)}, ${timeFormatter.format(date)}`
}

/** "19 Nov 2026, 10:24 AM" — the order-detail "Placed …" line. */
export function formatOrderPlaced(value: string | Date) {
  const date = toDate(value)
  if (!date) return "—"

  return `${dayMonthYearFormatter.format(date)}, ${timeFormatter.format(date)}`
}

/**
 * "10:24 AM" — a bare Yangon clock time, e.g. the categories screen's
 * "Saved in this tab" chip.
 */
export function formatClockTime(value: string | Date) {
  const date = toDate(value)
  if (!date) return "—"

  return timeFormatter.format(date)
}

/** "10:24 AM" — the mobile order card, where the day is implied. */
export function formatOrderTime(value: string | Date) {
  return formatClockTime(value)
}

export type YangonNow = {
  /** "Thu 19 Nov 2026" — the page subtitle. */
  shortDate: string
  /** "Thursday 19 Nov 2026" — the greeting banner. */
  longDate: string
  /** "10:30 AM" */
  time: string
  greeting: "Good morning" | "Good afternoon" | "Good evening"
  emoji: string
}

export function yangonNow(date: Date = new Date()): YangonNow {
  // Some ICU versions render midnight as "24" for a 2-digit 24h clock.
  const hour = Number(hourFormatter.format(date)) % 24

  const evening = hour >= 17
  const afternoon = hour >= 12 && hour < 17

  return {
    shortDate: joinParts(shortDateFormatter, date),
    longDate: joinParts(longDateFormatter, date),
    time: timeFormatter.format(date),
    greeting: evening
      ? "Good evening"
      : afternoon
        ? "Good afternoon"
        : "Good morning",
    emoji: evening ? "🌙" : afternoon ? "🌤️" : "☀️",
  }
}
