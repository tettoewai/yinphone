/**
 * Yangon-time strings for the admin screens.
 *
 * The shop runs on Asia/Yangon (UTC+6:30, no daylight saving), so dates are
 * always rendered in that zone rather than the browser's. The formatters are
 * built once at module scope because constructing one per render is expensive.
 */

const TIME_ZONE = "Asia/Yangon"

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
