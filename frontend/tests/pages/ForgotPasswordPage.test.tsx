/**
 * Component tests for ForgotPasswordPage.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'

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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forgot password form', () => {
    renderWithRouter(<ForgotPasswordPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    renderWithRouter(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /отправить/i })

    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })
  })

  it('shows success message after submission', async () => {
    renderWithRouter(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /отправить/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Проверьте email/i)).toBeInTheDocument()
    })
  })

  it('shows email in success message', async () => {
    renderWithRouter(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /отправить/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    })
  })

  it('has link back to login', () => {
    renderWithRouter(<ForgotPasswordPage />)

    expect(screen.getByText(/Вернуться ко входу/i)).toHaveAttribute('href', '/login')
  })

  it('clears error when user starts typing', async () => {
    renderWithRouter(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /отправить/i })

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

  it('shows loading state during submission', async () => {
    renderWithRouter(<ForgotPasswordPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /отправить/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/loading.../i)).toBeInTheDocument()
    })
  })
})
