/**
 * Authentication hook for managing auth state.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { authService } from '@/services/authService'
import type { User } from '@/types/auth'

/**
 * Hook return type.
 */
interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, password_confirm: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Auth context for providing auth state throughout the app.
 */
const AuthContext = createContext<UseAuthReturn | null>(null)

/**
 * Auth provider component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch current user.
   */
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      setError(null)
    } catch (err) {
      setUser(null)
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Login user.
   */
  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password)
    await fetchUser()
  }, [fetchUser])

  /**
   * Register user.
   */
  const register = useCallback(async (name: string, email: string, password: string, password_confirm: string) => {
    await authService.register(name, email, password, password_confirm)
    await fetchUser()
  }, [fetchUser])

  /**
   * Logout user.
   */
  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setIsLoading(false)
  }, [])

  /**
   * Load user on mount.
   */
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refetch: fetchUser,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

/**
 * Custom hook for managing authentication state.
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Hook to get current user.
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth()
  return user
}
