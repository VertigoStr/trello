/**
 * Tests for useAuth hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth, useIsAuthenticated, useCurrentUser } from '@/hooks/useAuth'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

// Wrapper component for AuthProvider
function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should return unauthenticated state when no token', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockRejectedValue(new Error('No token'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should return authenticated state when token is valid', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem('auth_token', 'valid-token')

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: expect.any(String),
    })
  })

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    )
  })
})

describe('useIsAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should return false when not authenticated', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockRejectedValue(new Error('No token'))

    const { result } = renderHook(() => useIsAuthenticated(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBe(false)
    })
  })

  it('should return true when authenticated', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem('auth_token', 'valid-token')

    const { result } = renderHook(() => useIsAuthenticated(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should return null when not authenticated', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockRejectedValue(new Error('No token'))

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeNull()
    })
  })

  it('should return user when authenticated', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem('auth_token', 'valid-token')

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        createdAt: expect.any(String),
      })
    })
  })
})
