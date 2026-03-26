/**
 * Tests for EditTaskModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditTaskModal } from '@/components/modals/EditTaskModal'

describe('EditTaskModal', () => {
  const mockOnHide = vi.fn()
  const mockOnUpdate = vi.fn()

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

  it('renders modal with title and pre-filled form', () => {
    render(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText(/редактировать задачу/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/название/i)).toHaveValue('Test Task')
    expect(screen.getByLabelText(/описание/i)).toHaveValue('Test description')
  })

  it('calls onHide when close button clicked', () => {
    render(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText(/отмена/i))
    expect(mockOnHide).toHaveBeenCalled()
  })

  it('shows validation error for empty title', async () => {
    render(
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

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/название обязательно/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for title too long', async () => {
    render(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'A'.repeat(256) } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/название не более 255 символов/i)).toBeInTheDocument()
    })
  })

  it('calls onUpdate with updated data', async () => {
    mockOnUpdate.mockResolvedValue({
      ...mockTask,
      title: 'Updated Task',
      description: 'Updated description',
      updatedAt: new Date().toISOString(),
    })

    render(
      <EditTaskModal
        show={true}
        onHide={mockOnHide}
        task={mockTask}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    const descriptionInput = screen.getByLabelText(/описание/i)
    
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ 
        title: 'Updated Task', 
        description: 'Updated description' 
      })
    })
  })

  it('allows editing only title', async () => {
    mockOnUpdate.mockResolvedValue({
      ...mockTask,
      title: 'Updated Task',
      updatedAt: new Date().toISOString(),
    })

    render(
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

  it('allows editing only description', async () => {
    mockOnUpdate.mockResolvedValue({
      ...mockTask,
      description: 'Updated description',
      updatedAt: new Date().toISOString(),
    })

    render(
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

  it('clears form after successful update', async () => {
    mockOnUpdate.mockResolvedValue({
      ...mockTask,
      title: 'Updated Task',
      updatedAt: new Date().toISOString(),
    })

    render(
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
      expect(mockOnUpdate).toHaveBeenCalled()
    })

    // Form should be cleared after successful update
    expect(titleInput).toHaveValue('')
  })

  it('shows loading state during update', async () => {
    mockOnUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
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

    // Button should show loading state
    await waitFor(() => {
      expect(saveButton).toBeDisabled()
    })
  })

  it('shows error message on API error', async () => {
    mockOnUpdate.mockRejectedValue(new Error('Failed to update task'))

    render(
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
      expect(screen.getByText(/Failed to update task/i)).toBeInTheDocument()
    })
  })

  it('shows error message on access denied', async () => {
    mockOnUpdate.mockRejectedValue(new Error('Access denied'))

    render(
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
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument()
    })
  })
})
