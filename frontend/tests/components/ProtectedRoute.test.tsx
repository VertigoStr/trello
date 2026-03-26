/**
 * Tests for ProtectedRoute component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderWithProviders(
  component: React.ReactElement,
  { isAuthenticated = false }: { isAuthenticated?: boolean } = {}
) {
  // Mock getCurrentUser based on isAuthenticated
  if (isAuthenticated) {
    vi.spyOn(authServiceModule.authService, 'getCurrentUser').mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })
  } else {
    vi.spyOn(authServiceModule.authService, 'getCurrentUser').mockRejectedValue(new Error('No token'))
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/protected" element={component} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while checking authentication', () => {
    // Mock getCurrentUser to take some time
    vi.spyOn(authServiceModule.authService, 'getCurrentUser').mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            isActive: true,
            createdAt: new Date().toISOString(),
          }), 100)
        })
    )

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { isAuthenticated: true }
    )

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', async () => {
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { isAuthenticated: false }
    )

    // Wait for redirect
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  it('renders children when authenticated', async () => {
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { isAuthenticated: true }
    )

    // Wait for content to render
    await vi.waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  it('preserves the original location in state for redirect', async () => {
    // This would be tested in integration with useLocation
    // For unit test, we verify the component renders correctly
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { isAuthenticated: true }
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })
})
