import { Navigate, Route, Routes } from "react-router-dom"

import {
  RequireAuth,
  RequirePasswordReset,
  RequireSignedOut,
} from "@/auth/guards"
import { ROUTES } from "@/lib/routes"
import { DashboardPage } from "@/pages/dashboard-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { LoginPage } from "@/pages/login-page"
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
        path={ROUTES.dashboard}
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
    </Routes>
  )
}
