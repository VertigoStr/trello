/**
 * Tests for EditColumnModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditColumnModal } from '@/components/modals/EditColumnModal'

describe('EditColumnModal', () => {
  const mockOnHide = vi.fn()
  const mockOnUpdate = vi.fn()

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

  it('renders modal with title and pre-filled form', () => {
    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText(/редактировать колонку/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/название/i)).toHaveValue('Test Column')
  })

  it('calls onHide when close button clicked', () => {
    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText(/отмена/i))
    expect(mockOnHide).toHaveBeenCalled()
  })

  it('shows validation error for empty title', async () => {
    render(
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

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/название обязательно/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for title too long', async () => {
    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
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
      ...mockColumn,
      title: 'Updated Column',
      updatedAt: new Date().toISOString(),
    })

    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Column' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ title: 'Updated Column' })
    })
  })

  it('clears form after successful update', async () => {
    mockOnUpdate.mockResolvedValue({
      ...mockColumn,
      title: 'Updated Column',
      updatedAt: new Date().toISOString(),
    })

    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Column' } })

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
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Column' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    // Button should show loading state
    await waitFor(() => {
      expect(saveButton).toBeDisabled()
    })
  })

  it('shows error message on API error', async () => {
    mockOnUpdate.mockRejectedValue(new Error('Failed to update column'))

    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Column' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to update column/i)).toBeInTheDocument()
    })
  })

  it('shows error message on access denied', async () => {
    mockOnUpdate.mockRejectedValue(new Error('Access denied'))

    render(
      <EditColumnModal
        show={true}
        onHide={mockOnHide}
        column={mockColumn}
        onUpdate={mockOnUpdate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Column' } })

    const saveButton = screen.getByText(/сохранить/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument()
    })
  })
})
