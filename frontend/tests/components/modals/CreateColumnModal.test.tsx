/**
 * Tests for CreateColumnModal component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateColumnModal } from '@/components/modals/CreateColumnModal'

describe('CreateColumnModal', () => {
  const mockOnHide = vi.fn()
  const mockOnCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with title and form', () => {
    render(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    expect(screen.getByText(/создать колонку/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/название/i)).toBeInTheDocument()
    expect(screen.getByText(/отмена/i)).toBeInTheDocument()
    expect(screen.getByText(/создать/i)).toBeInTheDocument()
  })

  it('calls onHide when close button clicked', () => {
    render(
      <CreateColumnModal
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
      <CreateColumnModal
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
      <CreateColumnModal
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

  it('calls onCreate with valid data', async () => {
    mockOnCreate.mockResolvedValue({
      id: 'column-123',
      boardId: 'board-123',
      title: 'Test Column',
      position: 0,
      createdAt: new Date().toISOString(),
    })

    render(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Column' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({ title: 'Test Column' })
    })
  })

  it('clears form after successful creation', async () => {
    mockOnCreate.mockResolvedValue({
      id: 'column-123',
      boardId: 'board-123',
      title: 'Test Column',
      position: 0,
      createdAt: new Date().toISOString(),
    })

    render(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Column' } })

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
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Column' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    // Button should show loading state
    await waitFor(() => {
      expect(createButton).toBeDisabled()
    })
  })

  it('shows error message on API error', async () => {
    mockOnCreate.mockRejectedValue(new Error('Failed to create column'))

    render(
      <CreateColumnModal
        show={true}
        onHide={mockOnHide}
        onCreate={mockOnCreate}
      />
    )

    const titleInput = screen.getByLabelText(/название/i)
    fireEvent.change(titleInput, { target: { value: 'Test Column' } })

    const createButton = screen.getByText(/создать/i)
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to create column/i)).toBeInTheDocument()
    })
  })
})
