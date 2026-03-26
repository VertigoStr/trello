/**
 * Integration tests for delete column flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { columnService } from '@/services/columnService'
import { DeleteColumnModal } from '@/components/modals/DeleteColumnModal'

// Mock columnService
vi.mock('@/services/columnService', () => ({
  columnService: {
    delete: vi.fn(),
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

describe('DeleteColumnFlow', () => {
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

  it('completes full delete column flow', async () => {
    const mockDelete = vi.mocked(columnService.delete)
    mockDelete.mockResolvedValueOnce()

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    // Click delete button
    const deleteButton = screen.getByText(/удалить/i)
    fireEvent.click(deleteButton)

    // Wait for API call
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalled()
    })

    // Verify modal closed
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalled()
    })
  })

  it('handles cancel action', async () => {
    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    // Click cancel button
    const cancelButton = screen.getByText(/отмена/i)
    fireEvent.click(cancelButton)

    expect(mockOnHide).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('shows task count warning', () => {
    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/5 задач/i)).toBeInTheDocument()
    expect(screen.getByText(/все задачи будут удалены/i)).toBeInTheDocument()
  })

  it('handles API error flow', async () => {
    const mockDelete = vi.mocked(columnService.delete)
    mockDelete.mockRejectedValueOnce(new Error('Failed to delete'))

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn().mockImplementation(async () => {
      await columnService.delete('column-123')
    })

    renderWithProviders(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    // Click delete
    const deleteButton = screen.getByText(/удалить/i)
    fireEvent.click(deleteButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to delete/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('handles owner-only restriction error', async () => {
    const mockDelete = vi.mocked(columnService.delete)
    mockDelete.mockRejectedValueOnce(new Error('Only board owner can delete columns'))

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn().mockImplementation(async () => {
      await columnService.delete('column-123')
    })

    renderWithProviders(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    // Click delete
    const deleteButton = screen.getByText(/удалить/i)
    fireEvent.click(deleteButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Only board owner/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('shows loading state during deletion', async () => {
    const mockDelete = vi.mocked(columnService.delete)
    mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    // Click delete
    const deleteButton = screen.getByText(/удалить/i)
    fireEvent.click(deleteButton)

    // Button should be disabled during loading
    expect(deleteButton).toBeDisabled()
    expect(deleteButton).toHaveTextContent(/удаление.../i)

    // Wait for completion
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled()
    })
  })
})
