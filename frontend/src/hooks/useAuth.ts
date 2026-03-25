/**
 * Authentication hook for managing auth state.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { User, AuthState } from '@/types/auth'
import { authService } from '@/services/authService'

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

/**
 * Auth context for providing auth state throughout the app.
 */
const AuthContext = createContext<AuthState | null>(null)

/**
 * Auth provider component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)

  /**
   * Check authentication status on mount.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
        }))
        return
      }

      try {
        const user = await authService.getCurrentUser()
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        // Token expired or invalid
        localStorage.removeItem('auth_token')
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      }
    }

    checkAuth()
  }, [])

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication state.
 */
export function useAuth(): AuthState {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Hook to check if user is authenticated.
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook to get current user.
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth()
  return user
}
