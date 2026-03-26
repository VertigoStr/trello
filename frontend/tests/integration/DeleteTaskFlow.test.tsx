/**
 * Integration tests for delete task flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { taskService } from '@/services/taskService'
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal'

// Mock taskService
vi.mock('@/services/taskService', () => ({
  taskService: {
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

describe('DeleteTaskFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full delete task flow', async () => {
    const mockDelete = vi.mocked(taskService.delete)
    mockDelete.mockResolvedValueOnce()

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
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
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    // Click cancel button
    const cancelButton = screen.getByText(/отмена/i)
    fireEvent.click(cancelButton)

    expect(mockOnHide).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('handles API error flow', async () => {
    const mockDelete = vi.mocked(taskService.delete)
    mockDelete.mockRejectedValueOnce(new Error('Failed to delete'))

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn().mockImplementation(async () => {
      await taskService.delete('task-123')
    })

    renderWithProviders(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
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

  it('handles access denied error', async () => {
    const mockDelete = vi.mocked(taskService.delete)
    mockDelete.mockRejectedValueOnce(new Error('Access denied'))

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn().mockImplementation(async () => {
      await taskService.delete('task-123')
    })

    renderWithProviders(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    // Click delete
    const deleteButton = screen.getByText(/удалить/i)
    fireEvent.click(deleteButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument()
    })

    // Modal should still be open
    expect(mockOnHide).not.toHaveBeenCalled()
  })

  it('shows loading state during deletion', async () => {
    const mockDelete = vi.mocked(taskService.delete)
    mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))

    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
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

  it('shows column deletion warning with task count', () => {
    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Column"
        itemType="column"
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/5 задач/i)).toBeInTheDocument()
    expect(screen.getByText(/все задачи будут удалены/i)).toBeInTheDocument()
  })

  it('shows task deletion warning', () => {
    const mockOnHide = vi.fn()
    const mockOnDelete = vi.fn()

    renderWithProviders(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/это действие нельзя отменить/i)).toBeInTheDocument()
  })
})
