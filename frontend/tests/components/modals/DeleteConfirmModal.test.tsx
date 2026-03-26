/**
 * Tests for DeleteConfirmModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal'

describe('DeleteConfirmModal', () => {
  const mockOnHide = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with confirmation message', () => {
    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/удалить задачу\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Task/i)).toBeInTheDocument()
    expect(screen.getByText(/отмена/i)).toBeInTheDocument()
    expect(screen.getByText(/удалить/i)).toBeInTheDocument()
  })

  it('calls onHide when cancel button clicked', () => {
    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/отмена/i))
    expect(mockOnHide).toHaveBeenCalled()
  })

  it('calls onDelete when delete button clicked', async () => {
    mockOnDelete.mockResolvedValue(undefined)

    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/удалить/i))

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalled()
    })
  })

  it('shows loading state during deletion', async () => {
    mockOnDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/удалить/i))

    await waitFor(() => {
      expect(screen.getByText(/удаление.../i)).toBeInTheDocument()
    })
  })

  it('disables delete button while deleting', async () => {
    mockOnDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByText(/удалить/i)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteButton).toBeDisabled()
    })
  })

  it('shows error message on delete failure', async () => {
    mockOnDelete.mockRejectedValue(new Error('Failed to delete'))

    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/удалить/i))

    await waitFor(() => {
      expect(screen.getByText(/Failed to delete/i)).toBeInTheDocument()
    })
  })

  it('shows access denied error', async () => {
    mockOnDelete.mockRejectedValue(new Error('Access denied'))

    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/удалить/i))

    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument()
    })
  })

  it('renders column deletion warning', () => {
    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Column"
        itemType="column"
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/удалить колонку\?/i)).toBeInTheDocument()
    expect(screen.getByText(/5 задач/i)).toBeInTheDocument()
  })

  it('renders task deletion warning', () => {
    render(
      <DeleteConfirmModal
        show={true}
        onHide={mockOnHide}
        itemName="Test Task"
        itemType="task"
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/удалить задачу\?/i)).toBeInTheDocument()
    expect(screen.getByText(/это действие нельзя отменить/i)).toBeInTheDocument()
  })
})
