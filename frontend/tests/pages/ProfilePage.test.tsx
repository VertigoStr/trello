/**
 * Component tests for ProfilePage.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProfilePage } from '@/pages/ProfilePage'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}))

function renderWithProviders(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user profile data', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    renderWithProviders(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('shows profile heading', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    renderWithProviders(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Профиль')).toBeInTheDocument()
    })
  })

  it('shows labels for name and email', async () => {
    const mockGetCurrentUser = vi.spyOn(authServiceModule.authService, 'getCurrentUser')
    mockGetCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    renderWithProviders(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Имя')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })
})
