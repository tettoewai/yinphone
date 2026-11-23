import type { Locale } from "next-intl"

const MYANMAR_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"]

/**
 * Swaps ASCII digits for the locale's own digits. Myanmar keeps Latin digits in
 * URLs, slugs and size codes, so only display strings go through here.
 */
export function localizeDigits(text: string, locale: Locale) {
  if (locale !== "my") return text

  return text.replace(/\d/g, (digit) => MYANMAR_DIGITS[Number(digit)] ?? digit)
}

/** `85000` → `၈၅,၀၀၀` in Myanmar, `85,000` in English. */
export function formatDigits(value: number, locale: Locale, grouping = false) {
  const text = grouping ? value.toLocaleString("en-US") : String(value)

  return localizeDigits(text, locale)
}

export function formatPrice(value: number, locale: Locale) {
  return `${formatDigits(value, locale, true)} ${locale === "my" ? "ကျပ်" : locale === "en" ? "Ks" : ""}`
}
