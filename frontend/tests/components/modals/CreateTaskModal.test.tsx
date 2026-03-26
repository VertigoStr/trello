/**
 * Tests for CreateTaskModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateTaskModal } from '@/components/modals/CreateTaskModal'

describe('CreateTaskModal', () => {
  const mockOnHide = vi.fn()
  const mockOnCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with title and form', () => {
    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    expect(screen.getByText(/создать задачу/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/название/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument()
    expect(screen.getByText(/отмена/i)).toBeInTheDocument()
    expect(screen.getByText(/создать/i)).toBeInTheDocument()
  })

  it('calls onHide when close button clicked', () => {
    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    fireEvent.click(screen.getByText(/отмена/i))
    expect(mockOnHide).toHaveBeenCalled()
  })

  it('shows validation error for empty title', async () => {
    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/название обязательно/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for title too long', async () => {
    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'A'.repeat(256) } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/название не более 255 символов/i)).toBeInTheDocument()
    })
  })

  it('accepts optional description', async () => {
    mockOnCreate.mockResolvedValue({
      id: 'task-123',
      columnId: 'column-123',
      title: 'Test Task',
      description: '',
      position: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({ title: 'Test Task', description: '' })
    })
  })

  it('calls onCreate with valid data including description', async () => {
    mockOnCreate.mockResolvedValue({
      id: 'task-123',
      columnId: 'column-123',
      title: 'Test Task',
      description: 'Test description',
      position: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    const descriptionInput = screen.getByLabelText(/описание/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({ 
        title: 'Test Task', 
        description: 'Test description' 
      })
    })
  })

  it('clears form after successful creation', async () => {
    mockOnCreate.mockResolvedValue({
      id: 'task-123',
      columnId: 'column-123',
      title: 'Test Task',
      description: '',
      position: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalled()
    })

    // Form should be cleared after successful creation
    expect(titleInput).toHaveValue('')
  })

  it('shows loading state during creation', async () => {
    mockOnCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Button should show loading state
    await waitFor(() => {
      expect(createButton).toBeDisabled()
    })
  })

  it('shows error message on API error', async () => {
    mockOnCreate.mockRejectedValue(new Error('Failed to create task'))

    render(
      <CreateTaskModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to create task/i)).toBeInTheDocument()
    })
  })
})
