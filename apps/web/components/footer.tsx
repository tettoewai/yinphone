"use client"

import { useTranslations } from "next-intl"

import { BrandMark } from "@workspace/ui/components/brand-mark"

import { Link, usePathname } from "@/i18n/navigation"

export default function Footer() {
  const pathname = usePathname()
  const t = useTranslations("Nav")
  const home = useTranslations("Home")

  // Product and order screens are focused, modal-like flows.
  if (pathname?.startsWith("/products")) return null

  return (
    <footer className="mx-auto flex w-full max-w-md flex-col bg-card px-6 pt-6 pb-10 md:max-w-3xl md:px-8 md:pt-8 lg:max-w-5xl">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary">
          <BrandMark className="h-[18px] w-[24px] text-primary-foreground" />
        </div>
        <p className="font-heading text-2xl">YinPhone Boutique Yangon</p>
      </Link>
      <p className="mt-4 font-body text-muted-foreground">
        {home("footerTagline")}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-primary">
        <Link href="/catalog?sort=newest" className="min-h-[28px]">
          {t("newArrivals")}
        </Link>
        <Link href="/catalog?category=longyi" className="min-h-[28px]">
          {home("longyi")}
        </Link>
        <Link href="/saved" className="min-h-[28px]">
          {t("savedShort")}
        </Link>
        <Link href="/about" className="min-h-[28px]">
          {t("about")}
        </Link>
        <Link href="/contact" className="min-h-[28px]">
          {t("contact")}
        </Link>
      </div>
    </footer>
  )
}
