/**
 * Tests for useBoard hook with optimistic updates.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { taskService } from '@/services/taskService'
import { useBoard } from '@/hooks/useBoard'

// Mock services
vi.mock('@/services/boardService', () => ({
  boardService: {
    getById: vi.fn().mockResolvedValue({
      id: 'board-1',
      title: 'Test Board',
      description: '',
      owner_id: 'user-1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  },
}))

vi.mock('@/services/columnService', () => ({
  columnService: {
    getByBoard: vi.fn().mockResolvedValue([
      { id: 'column-1', boardId: 'board-1', title: 'Column 1', position: 0, createdAt: new Date().toISOString() },
      { id: 'column-2', boardId: 'board-1', title: 'Column 2', position: 1, createdAt: new Date().toISOString() },
    ]),
  },
}))

vi.mock('@/services/taskService', () => ({
  taskService: {
    getByBoard: vi.fn().mockResolvedValue([
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
    ]),
    move: vi.fn(),
  },
}))

describe('useBoard - optimistic updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('optimistically updates task position on move', async () => {
    const mockMove = vi.mocked(taskService.move).mockResolvedValue()

    const { result } = renderHook(() => useBoard('board-1'))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Move task
    await act(async () => {
      await result.current.moveTask('task-1', { columnId: 'column-2', position: 1 })
    })

    expect(mockMove).toHaveBeenCalledWith('task-1', { columnId: 'column-2', position: 1 })
  })

  it('rolls back on move error', async () => {
    const mockMove = vi.mocked(taskService.move).mockRejectedValue(new Error('Failed to move'))

    const { result } = renderHook(() => useBoard('board-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Get initial tasks state
    const initialTasks = result.current.tasks

    // Try to move task (should fail and rollback)
    await act(async () => {
      try {
        await result.current.moveTask('task-1', { columnId: 'column-2', position: 1 })
      } catch (error) {
        // Expected error
      }
    })

    // Tasks should be rolled back to initial state
    expect(result.current.tasks).toEqual(initialTasks)
    expect(mockMove).toHaveBeenCalledWith('task-1', { columnId: 'column-2', position: 1 })
  })

  it('handles access denied error on move', async () => {
    const mockMove = vi.mocked(taskService.move).mockRejectedValue(new Error('Access denied'))

    const { result } = renderHook(() => useBoard('board-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      try {
        await result.current.moveTask('task-1', { columnId: 'column-2', position: 1 })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Access denied')
      }
    })

    expect(mockMove).toHaveBeenCalledWith('task-1', { columnId: 'column-2', position: 1 })
  })
})
