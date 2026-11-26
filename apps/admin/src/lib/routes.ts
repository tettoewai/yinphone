import type { AdminUser } from "@/lib/api"

export const ROUTES = {
  categories: "/categories",
  channels: "/channels",
  dashboard: "/dashboard",
  forgotPassword: "/forgot-password",
  login: "/login",
  orders: "/orders",
  /** Pattern only — build concrete links with `orderDetailPath`. */
  orderDetail: "/orders/:code",
  products: "/products",
  /** The add-product editor; static segment, so it outranks any `products/:id`. */
  productNew: "/products/new",
  resetPassword: "/reset-password",
  settings: "/settings",
} as const

/** `/orders/YP-2026-0001` for a given order code. */
export function orderDetailPath(code: string) {
  return `/orders/${encodeURIComponent(code)}`
}

/** Where a signed-in user belongs, given what the server says about them. */
export function landingFor(user: AdminUser) {
  return user.mustChangePassword ? ROUTES.resetPassword : ROUTES.dashboard
}
