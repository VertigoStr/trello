/**
 * ProtectedRoute component for protecting authenticated routes.
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    )
  }

  // Render children if authenticated
  return <>{children}</>
}
