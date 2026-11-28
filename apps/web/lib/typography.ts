/**
 * Heading line-heights by script.
 *
 * Latin display type (Jaguar) sets best tight — a 1.1 line-height is what makes
 * a serif headline read as a block. Myanmar needs roughly 1.6 or the stacked
 * consonants and medials collide. Both class strings are literals so Tailwind
 * still generates them; pick one from the active locale instead of shipping a
 * single compromise value that looks wrong for one of the two scripts.
 */
export type HeadingScale = "display" | "section"

export function headingLeading(locale: string, scale: HeadingScale) {
  if (locale === "my") {
    return scale === "display" ? "leading-[1.5]" : "leading-[1.6]"
  }

  return scale === "display" ? "leading-[1.08]" : "leading-[1.2]"
}
