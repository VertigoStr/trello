/**
 * Integration tests for edit task flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { taskService } from '@/services/taskService'
import { EditTaskModal } from '@/components/modals/EditTaskModal'

// Mock taskService
vi.mock('@/services/taskService', () => ({
  taskService: {
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

describe('EditTaskFlow', () => {
  const mockTask = {
    id: 'task-123',
    columnId: 'column-123',
    title: 'Test Task',
    description: 'Test description',
    position: 0,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full edit task flow', async () => {
    const mockUpdate = vi.mocked(taskService.update)
    mockUpdate.mockResolvedValueOnce({
      ...mockTask,
      title: 'Updated Task',
      description: 'Updated description',
      updatedAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    // Update task data
    const titleInput = screen.getByLabelText(/название/i)
    const descriptionInput = screen.getByLabelText(/описание/i)
    
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } })

    // Click save button
    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    // Wait for API call
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ 
        title: 'Updated Task', 
        description: 'Updated description' 
      })
    })

    // Verify modal closed
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalled()
    })
  })

  it('handles editing only title', async () => {
    const mockUpdate = vi.mocked(taskService.update)
    mockUpdate.mockResolvedValueOnce({
      ...mockTask,
      title: 'Updated Task',
      updatedAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ 
        title: 'Updated Task', 
        description: 'Test description' 
      })
    })
  })

  it('handles editing only description', async () => {
    const mockUpdate = vi.mocked(taskService.update)
    mockUpdate.mockResolvedValueOnce({
      ...mockTask,
      description: 'Updated description',
      updatedAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    const descriptionInput = screen.getByLabelText(/описание/i)
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ 
        title: 'Test Task', 
        description: 'Updated description' 
      })
    })
  })

  it('handles validation error flow', async () => {
    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
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
    const mockUpdate = vi.mocked(taskService.update)
    mockUpdate.mockRejectedValueOnce(new Error('Access denied'))

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn().mockImplementation(async () => {
      await taskService.update('task-123', { title: 'Updated' })
    })

    renderWithProviders(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
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
    const mockUpdate = vi.mocked(taskService.update)
    mockUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))

    const mockOnHide = vi.fn()
    const mockOnUpdate = vi.fn()

    renderWithProviders(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
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
