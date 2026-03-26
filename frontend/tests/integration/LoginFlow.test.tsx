/**
 * Integration tests for login flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/LoginPage'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  }
})

function renderApp(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('completes full login flow', async () => {
    // Mock successful login
    vi.spyOn(authServiceModule.authService, 'login').mockResolvedValueOnce({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock-token',
    })

    // Mock getCurrentUser for AuthProvider
    vi.spyOn(authServiceModule.authService, 'getCurrentUser').mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    renderApp(<LoginPage />)

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Wait for login to complete
    await waitFor(() => {
      expect(authServiceModule.authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      )
    })

    // Verify navigation to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    // Verify token was saved
    expect(localStorage.getItem('auth_token')).toBe('mock-token')
  })

  it('handles login error gracefully', async () => {
    // Mock login failure
    vi.spyOn(authServiceModule.authService, 'login').mockRejectedValueOnce(
      new Error('Неверный email или пароль')
    )

    renderApp(<LoginPage />)

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/неверный email или пароль/i)).toBeInTheDocument()
    })

    // Verify user stays on login page
    expect(mockNavigate).not.toHaveBeenCalled()

    // Verify token was not saved
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('prevents submission with invalid data', async () => {
    renderApp(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /войти/i })

    // Try to submit without filling the form
    fireEvent.click(submitButton)

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })

    // Verify authService.login was not called
    expect(authServiceModule.authService.login).not.toHaveBeenCalled()
  })

  it('clears form errors when user corrects input', async () => {
    renderApp(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    // Submit with invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })

    // Correct the email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } })

    // Wait for error to be cleared
    await waitFor(() => {
      expect(screen.queryByText(/некорректный формат email/i)).not.toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    // Mock slow login
    vi.spyOn(authServiceModule.authService, 'login').mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                user: {
                  id: 'user-123',
                  name: 'Test User',
                  email: 'test@example.com',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                },
                accessToken: 'mock-token',
              }),
            200
          )
        })
    )

    renderApp(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    fireEvent.click(submitButton)

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText(/loading.../i)).toBeInTheDocument()
    })

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument()
    })
  })

  it('navigates to original location after successful login', async () => {
    // Mock successful login
    vi.spyOn(authServiceModule.authService, 'login').mockResolvedValueOnce({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock-token',
    })

    // Mock useLocation to return a from state
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: { from: { pathname: '/profile' } } }),
      }
    })

    renderApp(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Wait for navigation to original location
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true })
    })
  })

  it('saves token to localStorage on successful login', async () => {
    // Mock successful login
    vi.spyOn(authServiceModule.authService, 'login').mockResolvedValueOnce({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'test-token-123',
    })

    renderApp(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('test-token-123')
    })
  })
})
