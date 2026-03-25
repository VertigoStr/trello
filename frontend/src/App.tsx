/**
 * Main App component with routing.
 */

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Header } from '@/components/layout/Header'
import { ROUTES } from '@/types/auth'

// Lazy load pages
const LoginPage = React.lazy(() => import('@/pages/LoginPage'))
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'))
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'))
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage'))

/**
 * Loading fallback component.
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                <Route
                  path={ROUTES.FORGOT_PASSWORD}
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path={ROUTES.RESET_PASSWORD}
                  element={<ResetPasswordPage />}
                />

                {/* Protected routes */}
                <Route
                  path={ROUTES.HOME}
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
