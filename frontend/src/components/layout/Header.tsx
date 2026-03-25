/**
 * Header component with navigation and logout.
 */

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { ROUTES } from '@/types/auth'
import { Button } from '@/components/common/Button'

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="text-xl font-bold text-blue-600">
            Trello Clone
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.PROFILE}
                  className="text-gray-700 hover:text-gray-900"
                >
                  {user?.name}
                </Link>
                <Button variant="secondary" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Войти
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
