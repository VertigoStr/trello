/**
 * Tests for DeleteColumnModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteColumnModal } from '@/components/modals/DeleteColumnModal'

describe('DeleteColumnModal', () => {
  const mockOnHide = vi.fn()
  const mockOnDelete = vi.fn()

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

  it('renders modal with column name and task count warning', () => {
    render(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/удалить колонку\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Column/i)).toBeInTheDocument()
    expect(screen.getByText(/5 задач/i)).toBeInTheDocument()
    expect(screen.getByText(/все задачи будут удалены/i)).toBeInTheDocument()
  })

  it('renders modal without task count when zero', () => {
    render(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={0}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/0 задач/i)).toBeInTheDocument()
  })

  it('calls onHide when cancel button clicked', () => {
    render(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/отмена/i))
    expect(mockOnHide).toHaveBeenCalled()
  })

  it('calls onDelete when delete button clicked', async () => {
    mockOnDelete.mockResolvedValue(undefined)

    render(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
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
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
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
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
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
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/удалить/i))

    await waitFor(() => {
      expect(screen.getByText(/Failed to delete/i)).toBeInTheDocument()
    })
  })

  it('shows owner-only error', async () => {
    mockOnDelete.mockRejectedValue(new Error('Only board owner can delete columns'))

    render(
      <DeleteColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        taskCount={5}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText(/удалить/i))

    await waitFor(() => {
      expect(screen.getByText(/Only board owner/i)).toBeInTheDocument()
    })
  })
})
