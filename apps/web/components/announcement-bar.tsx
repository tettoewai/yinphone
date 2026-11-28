import { getTranslations } from "next-intl/server"

/**
 * Thin burgundy strip above the header. It is the one place the brand colour
 * runs full width, which is why it carries only a single short line.
 */
export default async function AnnouncementBar() {
  const t = await getTranslations("Home")

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-0.5 px-4 py-2.5 text-center text-[11px] leading-[1.6] font-medium tracking-[0.14em] uppercase md:flex-row md:justify-center md:gap-3 md:text-xs lg:px-8">
        <span>{t("announcement.delivery")}</span>
        {/* Decorative rule: on a phone the two lines stack, so the divider
            only appears once they sit side by side. */}
        <span
          aria-hidden="true"
          className="hidden h-3 w-px bg-primary-foreground/40 md:block"
        />
        <span>{t("announcement.order")}</span>
      </div>
    </div>
  )
}
