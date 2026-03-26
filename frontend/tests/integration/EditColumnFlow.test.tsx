/**
 * Integration tests for edit column flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { columnService } from '@/services/columnService'
import { EditColumnModal } from '@/components/modals/EditColumnModal'

// Mock columnService
vi.mock('@/services/columnService', () => ({
  columnService: {
    update: vi.fn(),
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

describe('EditColumnFlow', () => {
  const mockColumn = {
    id: 'column-123',
    boardId: 'board-123',
    title: 'Test Column',
    position: 0,
    createdAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full edit column flow', async () => {
    const mockUpdate = vi.mocked(columnService.update)
    mockUpdate.mockResolvedValueOnce({
      ...mockColumn,
      title: 'Updated Column',
      updatedAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    // Update column title
    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Column' } })

    // Click save button
    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    // Wait for API call
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ title: 'Updated Column' })
    })

    // Verify modal closed
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalled()
    })
  })

  it('handles validation error flow', async () => {
    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    // Clear title
    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: '' } })

    // Click save
    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/название обязательно/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('handles API error flow', async () => {
    const mockUpdate = vi.mocked(columnService.update)
    mockUpdate.mockRejectedValueOnce(new Error('Access denied'))

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn().mockImplementation(async () => {
      await columnService.update('column-123', { title: 'Updated' })
    })

    renderWithProviders(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('handles loading state during API call', async () => {
    const mockUpdate = vi.mocked(columnService.update)
    mockUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    // Button should be disabled during loading
    expect(saveButton).toBeDisabled()
    expect(saveButton).toHaveTextContent(/сохранение.../i)

    // Wait for completion
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled()
    })
  })
})
