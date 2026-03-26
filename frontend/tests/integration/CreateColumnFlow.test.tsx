/**
 * Integration tests for create column flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { columnService } from '@/services/columnService'
import { CreateColumnModal } from '@/components/modals/CreateColumnModal'

// Mock columnService
vi.mock('@/services/columnService', () => ({
  columnService: {
    create: vi.fn(),
  },
}))

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('CreateColumnFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full create column flow', async () => {
    const mockCreate = vi.mocked(columnService.create)
    mockCreate.mockResolvedValueOnce({
      id: 'column-123',
      boardId: 'board-123',
      title: 'New Column',
      position: 0,
      createdAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Enter column title
    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'New Column' })

    // Click create button
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Wait for API call
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({ title: 'New Column' })
    })

    // Verify modal closed
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalled()
    })
  })

  it('handles validation error flow', async () => {
    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Try to create with empty title
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/название обязательно/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('handles API error flow', async () => {
    const mockCreate = vi.mocked(columnService.create)
    mockCreate.mockRejectedValueOnce(new Error('Access denied'))

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn().mockImplementation(async () => {
      await columnService.create('board-123', { title: 'Test' })
    })

    renderWithProviders(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Enter valid title
    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test' } })

    // Click create
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('handles loading state during API call', async () => {
    const mockCreate = vi.mocked(columnService.create)
    mockCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Enter title
    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test' } })

    // Click create
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Button should be disabled during loading
    expect(createButton).toBeDisabled()
    expect(createButton).toHaveTextContent(/создание.../i)

    // Wait for completion
    await waitFor(() => {
      expect(createButton).not.toBeDisabled()
    })
  })
})
