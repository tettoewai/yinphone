import type { AdminUser } from "@/lib/api"

export const ROUTES = {
  dashboard: "/dashboard",
  forgotPassword: "/forgot-password",
  login: "/login",
  resetPassword: "/reset-password",
} as const

/** Where a signed-in user belongs, given what the server says about them. */
export function landingFor(user: AdminUser) {
  return user.mustChangePassword ? ROUTES.resetPassword : ROUTES.dashboard
}
