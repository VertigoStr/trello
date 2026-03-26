/**
 * Integration tests for registration flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { RegisterPage } from '@/pages/RegisterPage'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    register: vi.fn(),
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
  }
})

function renderApp(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('RegistrationFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full registration flow', async () => {
    // Mock successful registration
    vi.spyOn(authServiceModule.authService, 'register').mockResolvedValueOnce({
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

    renderApp(<RegisterPage />)

    // Fill in the form
    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Wait for registration to complete
    await waitFor(() => {
      expect(authServiceModule.authService.register).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        'password123'
      )
    })

    // Verify navigation to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    // Verify token was saved
    expect(localStorage.getItem('auth_token')).toBe('mock-token')
  })

  it('handles registration error gracefully', async () => {
    // Mock registration failure
    vi.spyOn(authServiceModule.authService, 'register').mockRejectedValueOnce(
      new Error('Email already exists')
    )

    renderApp(<RegisterPage />)

    // Fill in the form
    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/email уже используется/i)).toBeInTheDocument()
    })

    // Verify user stays on registration page
    expect(mockNavigate).not.toHaveBeenCalled()

    // Verify token was not saved
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('prevents submission with invalid data', async () => {
    renderApp(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    // Try to submit without filling the form
    fireEvent.click(submitButton)

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/имя должно содержать/i)).toBeInTheDocument()
    })

    // Verify authService.register was not called
    expect(authServiceModule.authService.register).not.toHaveBeenCalled()
  })

  it('clears form errors when user corrects input', async () => {
    renderApp(<RegisterPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

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

  it('shows loading state during registration', async () => {
    // Mock slow registration
    vi.spyOn(authServiceModule.authService, 'register').mockImplementation(
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

    renderApp(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'Test' } })
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
})
