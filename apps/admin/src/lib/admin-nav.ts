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
  /** Route the rail links to; every item has a screen behind it. */
  to: string
  /**
   * Rendered as the gold count chip. The orders item's chip is the live NEW
   * count from the dashboard overview, passed in by `AdminSidebar`; anything
   * else here is a static label.
   */
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
    to: ROUTES.orders,
  },
  {
    key: "products",
    label: "ထုတ်ကုန်များ",
    labelEn: "Products",
    icon: Shirt,
    to: ROUTES.products,
  },
  {
    key: "categories",
    label: "အမျိုးအစားများ",
    labelEn: "Categories",
    icon: Tags,
    to: ROUTES.categories,
  },
  {
    key: "channels",
    label: "ချန်နယ်များ",
    labelEn: "Channels",
    icon: MessageCircle,
    to: ROUTES.channels,
  },
  {
    key: "settings",
    label: "ဆက်တင်များ",
    labelEn: "Settings",
    icon: Settings,
    to: ROUTES.settings,
  },
]

export function navItemForPath(pathname: string) {
  return ADMIN_NAV.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  )
}
