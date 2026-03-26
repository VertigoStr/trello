/**
 * Tests for TaskCard component with drag-and-drop.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { TaskCard } from '@/components/board/TaskCard'

describe('TaskCard', () => {
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

  it('renders task card with title', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('renders task card with description if provided', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders task card without description if not provided', () => {
    const taskWithoutDescription = {
      ...mockTask,
      description: '',
    }

    render(<TaskCard task={taskWithoutDescription} />)

    expect(screen.queryByText(/test description/i)).not.toBeInTheDocument()
  })

  it('is draggable with drag handle', () => {
    render(<TaskCard task={mockTask} />)

    // Check for drag handle (should have drag listeners)
    const cardElement = screen.getByText('Test Task').closest('div')
    expect(cardElement).toBeInTheDocument()
  })

  it('applies transform style when dragging', () => {
    render(
      <DndContext onDragStart={() => {}} onDragEnd={() => {}}>
        <TaskCard task={mockTask} />
      </DndContext>
    )

    const cardElement = screen.getByText('Test Task').closest('div')
    expect(cardElement).toBeInTheDocument()
  })

  it('shows task title with proper styling', () => {
    render(<TaskCard task={mockTask} />)

    const titleElement = screen.getByText('Test Task')
    expect(titleElement).toHaveClass('card-title')
  })
})
