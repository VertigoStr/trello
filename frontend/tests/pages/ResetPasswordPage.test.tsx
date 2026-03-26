/**
 * Component tests for ResetPasswordPage.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('token=valid-token'), vi.fn()],
  }
})

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders reset password form with token', () => {
    renderWithRouter(<ResetPasswordPage />)

    expect(screen.getByLabelText(/новый пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сбросить пароль/i })).toBeInTheDocument()
  })

  it('shows validation error for short password', async () => {
    renderWithRouter(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/новый пароль/i)
    const submitButton = screen.getByRole('button', { name: /сбросить пароль/i })

    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/минимум 8 символов/i)).toBeInTheDocument()
    })
  })

  it('shows error for missing token', () => {
    // Mock missing token
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams(''), vi.fn()],
      }
    })

    renderWithRouter(<ResetPasswordPage />)

    expect(screen.getByText(/Недействительная ссылка/i)).toBeInTheDocument()
  })

  it('has link back to login', () => {
    renderWithRouter(<ResetPasswordPage />)

    expect(screen.getByText(/Вернуться ко входу/i)).toHaveAttribute('href', '/login')
  })

  it('shows loading state during submission', async () => {
    renderWithRouter(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/новый пароль/i)
    const submitButton = screen.getByRole('button', { name: /сбросить пароль/i })

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/loading.../i)).toBeInTheDocument()
    })
  })

  it('clears error when user starts typing', async () => {
    renderWithRouter(<ResetPasswordPage />)

    const passwordInput = screen.getByLabelText(/новый пароль/i)
    const submitButton = screen.getByRole('button', { name: /сбросить пароль/i })

    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/минимум 8 символов/i)).toBeInTheDocument()
    })

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })

    await waitFor(() => {
      expect(screen.queryByText(/минимум 8 символов/i)).not.toBeInTheDocument()
    })
  })

  it('shows invalid link message when token is missing', async () => {
    // Mock missing token
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams(''), vi.fn()],
      }
    })

    renderWithRouter(<ResetPasswordPage />)

    await waitFor(() => {
      expect(screen.getByText(/Ссылка для сброса пароля недействительна/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Запросить новую ссылку/i)).toHaveAttribute('href', '/forgot-password')
  })
})
