/**
 * Component tests for DashboardPage.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '@/pages/DashboardPage'

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('DashboardPage', () => {
  it('renders welcome message', () => {
    renderWithRouter(<DashboardPage />)

    expect(screen.getByText('Добро пожаловать!')).toBeInTheDocument()
  })

  it('renders dashboard description', () => {
    renderWithRouter(<DashboardPage />)

    expect(screen.getByText(/Это главная страница/i)).toBeInTheDocument()
  })

  it('shows empty state message', () => {
    renderWithRouter(<DashboardPage />)

    expect(screen.getByText(/У вас пока нет досок/i)).toBeInTheDocument()
  })

  it('has proper heading structure', () => {
    renderWithRouter(<DashboardPage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Добро пожаловать!')
  })
})
