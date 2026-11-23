/**
 * Display formatters shared by the admin screens.
 *
 * Prices are stored as whole kyat (`priceMmk`, `totalMmk`), so there are no
 * decimals to format anywhere.
 */

const whole = new Intl.NumberFormat("en-US")

/** "684,500 Ks" — the format the design uses in tables and totals. */
export function formatMmk(amount: number) {
  return `${whole.format(amount)} Ks`
}

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

/** "42K" — for chart labels where there is no room for every digit. */
export function formatMmkCompact(amount: number) {
  return compact.format(amount)
}
