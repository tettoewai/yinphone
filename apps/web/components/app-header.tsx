"use client"

import { Heart, Leaf, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import AppMenu from "@/components/app-menu"
import { useFavourites } from "@/lib/favourites"

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { count, isReady } = useFavourites()

  return (
    <header className="flex items-center justify-between border-b border-border bg-background/95 px-4 py-3">
      <Link
        href="/"
        aria-label="YinPhone home"
        className="flex items-center gap-1.5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Leaf
            className="size-[18px] text-primary-foreground"
            strokeWidth={2.67}
          />
        </div>
        <div className="leading-none">
          <div className="font-heading text-lg font-bold tracking-tight text-foreground">
            YinPhone
          </div>
          <div className="font-body text-xs text-muted-foreground">Yangon</div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/saved"
          aria-label={`Saved items${isReady && count > 0 ? ` (${count})` : ""}`}
          className="relative flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card"
        >
          <Heart className="size-5 text-foreground" strokeWidth={2.4} />
          {isReady && count > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-xl bg-accent px-1 text-[11px] font-bold text-accent-foreground">
              {count}
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          aria-haspopup="dialog"
          className="flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card"
        >
          <Menu className="size-5 text-foreground" />
        </button>
      </div>

      {isMenuOpen ? <AppMenu onClose={() => setIsMenuOpen(false)} /> : null}
    </header>
  )
}
