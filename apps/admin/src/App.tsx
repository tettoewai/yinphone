import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import {
  RequireAuth,
  RequireOwner,
  RequirePasswordReset,
  RequireSignedOut,
} from "@/auth/guards"
import { AdminLayout } from "@/components/admin-layout"
import { DashboardSkeleton } from "@/components/states/dashboard-skeleton"
import { SessionExpiredDialog } from "@/components/states/session-expired"
import { ROUTES } from "@/lib/routes"
import { CategoriesPage } from "@/pages/categories-page"
import { ChannelsPage } from "@/pages/channels-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { LoginPage } from "@/pages/login-page"
import { OrderDetailsPage } from "@/pages/order-details-page"
import { OrdersPage } from "@/pages/orders-page"
import { ProductFormPage } from "@/pages/product-form-page"
import { ProductsPage } from "@/pages/products-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"
import { SettingsPage } from "@/pages/settings-page"
import { StatesPage } from "@/pages/states-page"

/**
 * The dashboard is the heaviest screen (greeting banner, four KPI cards, the
 * sales chart and the orders table), so it gets its own chunk. The skeleton in
 * the fallback is the same one the states sheet shows.
 */
const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  }))
)

export default function App() {
  return (
    <>
      {/* Any 401 that is not a login attempt asks for the password again, in
          place, so the screen and its unsaved work stay mounted. */}
      <SessionExpiredDialog />

      <Routes>
        <Route
          path={ROUTES.login}
          element={
            <RequireSignedOut>
              <LoginPage />
            </RequireSignedOut>
          }
        />
        <Route
          path={ROUTES.forgotPassword}
          element={
            <RequireSignedOut>
              <ForgotPasswordPage />
            </RequireSignedOut>
          }
        />
        <Route
          path={ROUTES.resetPassword}
          element={
            <RequirePasswordReset>
              <ResetPasswordPage />
            </RequirePasswordReset>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route
            path={ROUTES.dashboard}
            element={
              <Suspense
                fallback={
                  <div className="px-4 py-5 sm:px-6">
                    <DashboardSkeleton />
                  </div>
                }
              >
                <DashboardPage />
              </Suspense>
            }
          />
          <Route path={ROUTES.orders} element={<OrdersPage />} />
          <Route path={ROUTES.orderDetail} element={<OrderDetailsPage />} />
          <Route path={ROUTES.products} element={<ProductsPage />} />
          <Route path={ROUTES.productNew} element={<ProductFormPage />} />
          <Route path={ROUTES.categories} element={<CategoriesPage />} />
          {/* Channel links are an OWNER-only write (POST/PATCH), so the screen
              is gated like Settings rather than letting STAFF hit a 403 on save. */}
          <Route
            path={ROUTES.channels}
            element={
              <RequireOwner>
                <ChannelsPage />
              </RequireOwner>
            }
          />
          <Route
            path={ROUTES.settings}
            element={
              <RequireOwner>
                <SettingsPage />
              </RequireOwner>
            }
          />
          <Route path={ROUTES.states} element={<StatesPage />} />
        </Route>
        <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </>
  )
}
