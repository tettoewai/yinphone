"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  // Product and order screens are focused, modal-like flows.
  if (pathname?.startsWith("/products")) return null

  return (
    <footer className="mx-auto flex w-full max-w-md flex-col bg-card px-6 pt-6 pb-10">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary">
          <Image
            src="/logo.svg"
            width={50}
            height={50}
            alt="YinPhone logo"
            className="size-full brightness-0 invert"
          />
        </div>
        <p className="font-heading text-2xl">YinPhone Boutique Yangon</p>
      </Link>
      <p className="mt-4 font-body text-muted-foreground">
        နေ့စဉ်ဝတ် ချည်ထည်နှင့် ရာသီဖက်ရှင်များ — Chat ဖြင့် လွယ်ကူစွာ
        မှာယူနိုင်ပါတယ်။
      </p>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-primary">
        <Link href="/catalog?sort=newest" className="min-h-[28px]">
          New arrivals
        </Link>
        <Link href="/catalog?category=sale" className="min-h-[28px]">
          Sale
        </Link>
        <Link href="/saved" className="min-h-[28px]">
          Saved
        </Link>
        <Link href="/about" className="min-h-[28px]">
          About
        </Link>
        <Link href="/contact" className="min-h-[28px]">
          Contact
        </Link>
      </div>
    </footer>
  )
}
