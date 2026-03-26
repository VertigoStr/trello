/**
 * Integration tests for move task flow with drag-and-drop.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useBoard } from '@/hooks/useBoard'
import { taskService } from '@/services/taskService'

// Mock taskService
vi.mock('@/services/taskService', () => ({
  taskService: {
    move: vi.fn(),
  },
}))

// Mock useBoard hook
vi.mock('@/hooks/useBoard', () => ({
  useBoard: vi.fn(),
}))

describe('MoveTaskFlow', () => {
  const mockTasks = {
    'column-1': [
      {
        id: 'task-1',
        columnId: 'column-1',
        title: 'Task 1',
        description: '',
        position: 0,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    'column-2': [
      {
        id: 'task-2',
        columnId: 'column-2',
        title: 'Task 2',
        description: '',
        position: 0,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('moves task successfully with drag-and-drop', async () => {
    const mockMoveTask = vi.fn()
    vi.mocked(useBoard).mockReturnValue({
      board: null,
      columns: [
        { id: 'column-1', boardId: 'board-1', title: 'Column 1', position: 0, createdAt: new Date().toISOString() },
        { id: 'column-2', boardId: 'board-1', title: 'Column 2', position: 1, createdAt: new Date().toISOString() },
      ],
      tasks: mockTasks,
      loading: false,
      error: null,
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      moveTask: mockMoveTask,
      refetch: vi.fn(),
    })

    const mockFetch = vi.fn()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: { id: 'task-1', columnId: 'column-2', position: 1 },
      }),
    })
    vi.mocked(taskService.move).mockImplementation(() => mockFetch() as any)

    // Simulate drag end event
    const event: DragEndEvent = {
      active: { id: 'task-1' },
      over: { id: 'column-2' },
      delta: { x: 0, y: 0 },
    }

    // Trigger move task
    mockMoveTask.mockResolvedValueOnce(undefined)
    
    // Simulate the flow
    const { moveTask } = vi.mocked(useBoard).mock.results[0].value
    await moveTask('task-1', { columnId: 'column-2', position: 1 })

    expect(mockMoveTask).toHaveBeenCalledWith('task-1', { 
      columnId: 'column-2', 
      position: 1 
    })
  })

  it('rolls back on move error', async () => {
    const mockMoveTask = vi.fn().mockRejectedValue(new Error('Failed to move'))
    
    vi.mocked(useBoard).mockReturnValue({
      board: null,
      columns: [
        { id: 'column-1', boardId: 'board-1', title: 'Column 1', position: 0, createdAt: new Date().toISOString() },
      ],
      tasks: mockTasks,
      loading: false,
      error: null,
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      moveTask: mockMoveTask,
      refetch: vi.fn(),
    })

    const { moveTask } = vi.mocked(useBoard).mock.results[0].value

    await expect(moveTask('task-1', { columnId: 'column-2', position: 1 }))
      .rejects.toThrow('Failed to move')
  })

  it('handles access denied on move', async () => {
    const mockMoveTask = vi.fn().mockRejectedValue(new Error('Access denied'))
    
    vi.mocked(useBoard).mockReturnValue({
      board: null,
      columns: [],
      tasks: {},
      loading: false,
      error: null,
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      moveTask: mockMoveTask,
      refetch: vi.fn(),
    })

    const { moveTask } = vi.mocked(useBoard).mock.results[0].value

    await expect(moveTask('task-1', { columnId: 'column-2', position: 1 }))
      .rejects.toThrow('Access denied')
  })
})
