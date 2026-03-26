/**
 * Component tests for LoginPage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
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

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithRouter(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for empty password', async () => {
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/введите пароль/i)).toBeInTheDocument()
    })
  })

  it('clears error when user starts typing', async () => {
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } })

    await waitFor(() => {
      expect(screen.queryByText(/некорректный формат email/i)).not.toBeInTheDocument()
    })
  })

  it('calls authService.login with correct data on successful submission', async () => {
    const mockLogin = vi.spyOn(authServiceModule.authService, 'login')
    mockLogin.mockResolvedValueOnce({
      user: { id: '1', name: 'John', email: 'john@example.com', isActive: true, createdAt: '' },
      accessToken: 'token',
    })

    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'password123')
    })
  })

  it('shows error message on login failure', async () => {
    const mockLogin = vi.spyOn(authServiceModule.authService, 'login')
    mockLogin.mockRejectedValueOnce(new Error('Неверный email или пароль'))

    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/неверный email или пароль/i)).toBeInTheDocument()
    })
  })

  it('navigates to dashboard on successful login', async () => {
    const mockLogin = vi.spyOn(authServiceModule.authService, 'login')
    mockLogin.mockResolvedValueOnce({
      user: { id: '1', name: 'John', email: 'john@example.com', isActive: true, createdAt: '' },
      accessToken: 'token',
    })

    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('shows loading state during login', async () => {
    const mockLogin = vi.spyOn(authServiceModule.authService, 'login')
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                user: { id: '1', name: 'John', email: 'john@example.com', isActive: true, createdAt: '' },
                accessToken: 'token',
              }),
            100
          )
        })
    )

    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/loading.../i)).toBeInTheDocument()
    })
  })

  it('has link to forgot password page', () => {
    renderWithRouter(<LoginPage />)

    expect(screen.getByText(/забыли пароль/i)).toHaveAttribute('href', '/forgot-password')
  })

  it('has link to register page', () => {
    renderWithRouter(<LoginPage />)

    expect(screen.getByText(/зарегистрироваться/i)).toHaveAttribute('href', '/register')
  })

  it('navigates to original location after login', async () => {
    const mockLogin = vi.spyOn(authServiceModule.authService, 'login')
    mockLogin.mockResolvedValueOnce({
      user: { id: '1', name: 'John', email: 'john@example.com', isActive: true, createdAt: '' },
      accessToken: 'token',
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

    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true })
    })
  })
})
