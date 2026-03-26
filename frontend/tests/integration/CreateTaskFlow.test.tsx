/**
 * Integration tests for create task flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { taskService } from '@/services/taskService'
import { CreateTaskModal } from '@/components/modals/CreateTaskModal'

// Mock taskService
vi.mock('@/services/taskService', () => ({
  taskService: {
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

describe('CreateTaskFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full create task flow with description', async () => {
    const mockCreate = vi.mocked(taskService.create)
    mockCreate.mockResolvedValueOnce({
      id: 'task-123',
      columnId: 'column-123',
      title: 'New Task',
      description: 'Task description',
      position: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Enter task data
    const titleInput = screen.getByLabelText(/название/i)
    const descriptionInput = screen.getByLabelText(/описание/i)
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } })

    // Click create button
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Wait for API call
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({ 
        title: 'New Task', 
        description: 'Task description' 
      })
    })

    // Verify modal closed
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalled()
    })
  })

  it('creates task without description', async () => {
    const mockCreate = vi.mocked(taskService.create)
    mockCreate.mockResolvedValueOnce({
      id: 'task-123',
      columnId: 'column-123',
      title: 'Simple Task',
      description: '',
      position: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Enter only title
    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Simple Task' } })

    // Click create
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Wait for API call
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({ 
        title: 'Simple Task', 
        description: '' 
      })
    })
  })

  it('handles validation error flow', async () => {
    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateTaskModal
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
    const mockCreate = vi.mocked(taskService.create)
    mockCreate.mockRejectedValueOnce(new Error('Access denied'))

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn().mockImplementation(async () => {
      await taskService.create('column-123', { title: 'Test', description: '' })
    })

    renderWithProviders(
      <CreateTaskModal
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
    const mockCreate = vi.mocked(taskService.create)
    mockCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))

    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateTaskModal
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

  it('validates description length', async () => {
    const mockOnHide = vi.fn()
    const mockOnCreate = vi.fn()

    renderWithProviders(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    // Enter valid title and too long description
    const titleInput = screen.getByLabelText(/название/i)
    const descriptionInput = screen.getByLabelText(/описание/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.change(descriptionInput, { target: { value: 'A'.repeat(10001) } })

    // Click create
    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Should show validation error for description
    await waitFor(() => {
      expect(screen.getByText(/описание не более 10000 символов/i)).toBeInTheDocument()
    })
  })
})
