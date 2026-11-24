import { Navigate, Route, Routes } from "react-router-dom"

import {
  RequireAuth,
  RequirePasswordReset,
  RequireSignedOut,
} from "@/auth/guards"
import { AdminLayout } from "@/components/admin-layout"
import { ROUTES } from "@/lib/routes"
import { DashboardPage } from "@/pages/dashboard-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { LoginPage } from "@/pages/login-page"
import { OrderDetailsPage } from "@/pages/order-details-page"
import { OrdersPage } from "@/pages/orders-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"

export default function App() {
  return (
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
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.orders} element={<OrdersPage />} />
        <Route path={ROUTES.orderDetail} element={<OrderDetailsPage />} />
      </Route>
      <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
    </Routes>
  )
}
