/**
 * Component tests for RegisterPage.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RegisterPage } from '@/pages/RegisterPage'
import * as authServiceModule from '@/services/authService'

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    register: vi.fn(),
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

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form', () => {
    renderWithRouter(<RegisterPage />)

    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument()
  })

  it('shows validation error for empty name', async () => {
    renderWithRouter(<RegisterPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/имя должно содержать/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    renderWithRouter(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    renderWithRouter(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/минимум 8 символов/i)).toBeInTheDocument()
    })
  })

  it('clears error when user starts typing', async () => {
    renderWithRouter(<RegisterPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    await waitFor(() => {
      expect(screen.queryByText(/некорректный формат email/i)).not.toBeInTheDocument()
    })
  })

  it('calls authService.register with correct data on successful submission', async () => {
    const mockRegister = vi.spyOn(authServiceModule.authService, 'register')
    mockRegister.mockResolvedValueOnce({
      user: { id: '1', name: 'John', email: 'john@example.com', isActive: true, createdAt: '' },
      accessToken: 'token',
    })

    renderWithRouter(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123')
    })
  })

  it('shows error message on registration failure', async () => {
    const mockRegister = vi.spyOn(authServiceModule.authService, 'register')
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'))

    renderWithRouter(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email уже используется/i)).toBeInTheDocument()
    })
  })

  it('navigates to dashboard on successful registration', async () => {
    const mockRegister = vi.spyOn(authServiceModule.authService, 'register')
    mockRegister.mockResolvedValueOnce({
      user: { id: '1', name: 'John', email: 'john@example.com', isActive: true, createdAt: '' },
      accessToken: 'token',
    })

    renderWithRouter(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows loading state during registration', async () => {
    const mockRegister = vi.spyOn(authServiceModule.authService, 'register')
    mockRegister.mockImplementation(
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

    renderWithRouter(<RegisterPage />)

    const nameInput = screen.getByLabelText(/имя/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i })

    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/loading.../i)).toBeInTheDocument()
    })
  })

  it('has link to login page', () => {
    renderWithRouter(<RegisterPage />)

    expect(screen.getByText(/уже есть аккаунт/i)).toBeInTheDocument()
    expect(screen.getByText(/войти/i)).toHaveAttribute('href', '/login')
  })
})
