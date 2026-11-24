import {
  LayoutDashboard,
  MessageCircle,
  Settings,
  Shirt,
  ShoppingBag,
  Tags,
  type LucideIcon,
} from "lucide-react"

import { ORDERS_MOCK } from "@/lib/orders-mock"
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
  /**
   * Rendered as the gold count chip. Derived from the mock orders until the
   * orders API can supply a real pending count.
   */
  badge?: number
}

/** Orders still waiting for a reply. Mock-derived until `GET /api/orders` exists. */
const pendingOrderCount = ORDERS_MOCK.filter(
  (order) => order.status === "NEW"
).length

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
    badge: pendingOrderCount,
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
  },
  {
    key: "settings",
    label: "ဆက်တင်များ",
    labelEn: "Settings",
    icon: Settings,
  },
]

export function navItemForPath(pathname: string) {
  return ADMIN_NAV.find(
    (item) =>
      item.to !== undefined &&
      (pathname === item.to || pathname.startsWith(`${item.to}/`))
  )
}
