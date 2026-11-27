import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { BrandMark } from "@workspace/ui/components/brand-mark"

export default async function AboutHero() {
  const t = await getTranslations("About.hero")

  return (
    <div className="relative">
      <Image
        src="https://i.pinimg.com/1200x/32/0a/af/320aaffbbfb570058cfd6b1f5d053c47.jpg"
        alt={t("imageAlt")}
        width={900}
        height={675}
        sizes="(min-width: 1024px) 1024px, (min-width: 768px) 768px, 100vw"
        priority
        className="aspect-[4/3] w-full object-cover md:aspect-[21/9]"
      />
      <div className="absolute right-4 bottom-3 left-4 flex items-center gap-3 rounded-md border border-border bg-card/95 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary">
          <BrandMark className="h-[18px] w-[24px] text-primary-foreground" />
        </span>
        <div className="min-w-0">
          <div className="font-heading text-base leading-tight font-bold text-foreground">
            YinPhone Boutique Yangon
          </div>
          <div className="font-body text-xs text-muted-foreground">
            {t("tags")}
          </div>
        </div>
      </div>
    </div>
  )
}
