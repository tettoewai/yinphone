import {
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

type Category = {
  href: string
  icon: LucideIcon
  myanmar: string
  label: string
  highlight?: boolean
}

const categories: Category[] = [
  {
    href: "/catalog",
    icon: Store,
    myanmar: "အားလုံး",
    label: "All",
  },
  {
    href: "/catalog?category=dresses",
    icon: Shirt,
    myanmar: "ဂါဝန်",
    label: "Dresses",
  },
  {
    href: "/catalog?category=tops",
    icon: Sparkles,
    myanmar: "အင်္ကျီ",
    label: "Tops",
  },
  {
    href: "/catalog?category=bags",
    icon: ShoppingBag,
    myanmar: "အိတ်",
    label: "Bags",
  },
  {
    href: "/catalog?category=sale",
    icon: Tag,
    myanmar: "လျှော့ဈေး",
    label: "Sale",
    highlight: true,
  },
]

export default function QuickCategories() {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-1">
      {categories.map(({ href, icon: Icon, myanmar, label, highlight }) => (
        <Link
          key={label}
          href={href}
          className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={`flex h-[64px] w-[64px] items-center justify-center rounded-xl border ${
              highlight ? "border-accent bg-accent" : "border-border bg-card"
            }`}
          >
            <Icon
              className={`size-[22px] ${
                highlight ? "text-accent-foreground" : "text-primary"
              }`}
            />
          </div>
          <div className="text-center leading-tight">
            <div className="font-body text-xs font-semibold text-foreground">
              {myanmar}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
