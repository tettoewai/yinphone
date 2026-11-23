import {
  LayoutDashboard,
  MessageCircle,
  Settings,
  Shirt,
  ShoppingBag,
  Tags,
  type LucideIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/routes"

export type AdminNavItem = {
  key: string
  label: string
  labelEn: string
  icon: LucideIcon
  /**
   * Omitted until the screen exists. Nav items without a route render as
   * disabled so the shell never links to the catch-all redirect.
   */
  to?: string
  /** Set once a real pending count is available, not guessed in the shell. */
  badge?: number
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  {
    key: "dashboard",
    label: "ဒက်ရှ်ဘုတ်",
    labelEn: "Dashboard",
    icon: LayoutDashboard,
    to: ROUTES.dashboard,
  },
  {
    key: "orders",
    label: "မှာယူမှုများ",
    labelEn: "Orders",
    icon: ShoppingBag,
  },
  {
    key: "products",
    label: "ထုတ်ကုန်များ",
    labelEn: "Products",
    icon: Shirt,
  },
  {
    key: "categories",
    label: "အမျိုးအစားများ",
    labelEn: "Categories",
    icon: Tags,
  },
  {
    key: "channels",
    label: "ချန်နယ်များ",
    labelEn: "Channels",
    icon: MessageCircle,
  },
  {
    key: "settings",
    label: "ဆက်တင်များ",
    labelEn: "Settings",
    icon: Settings,
  },
]

export function navItemForPath(pathname: string) {
  return ADMIN_NAV.find((item) => item.to !== undefined && item.to === pathname)
}
