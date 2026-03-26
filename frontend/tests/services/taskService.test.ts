/**
 * Tests for task service and validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { taskService } from '@/services/taskService'
import { TASK_LIMITS } from '@/types/task'

describe('taskService', () => {
  const mockFetch = vi.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = mockFetch
    localStorage.setItem('auth_token', 'test-token')
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('creates task successfully', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTask,
        }),
      })

      const result = await taskService.create('column-123', { 
        title: 'Test Task', 
        description: 'Test description' 
      })

      expect(result).toEqual(mockTask)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/columns/column-123/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({ 
            title: 'Test Task', 
            description: 'Test description' 
          }),
        })
      )
    })

    it('creates task without description', async () => {
      const mockTask = {
        id: 'task-123',
        columnId: 'column-123',
        title: 'Simple Task',
        description: '',
        position: 0,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTask,
        }),
      })

      const result = await taskService.create('column-123', { 
        title: 'Simple Task',
        description: '' 
      })

      expect(result).toEqual(mockTask)
    })

    it('handles API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'error',
          error: {
            code: 'ACCESS_DENIED',
            message: 'You do not have access to this column',
          },
        }),
      })

      await expect(taskService.create('column-123', { title: 'Test' }))
        .rejects.toThrow('You do not have access to this column')
    })
  })

  describe('update', () => {
    it('updates task successfully', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Updated Task',
        description: 'Updated description',
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTask,
        }),
      })

      const result = await taskService.update('task-123', { 
        title: 'Updated Task',
        description: 'Updated description' 
      })

      expect(result).toEqual(mockTask)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/task-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ 
            title: 'Updated Task',
            description: 'Updated description' 
          }),
        })
      )
    })
  })

  describe('delete', () => {
    it('deletes task successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      await taskService.delete('task-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/task-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('move', () => {
    it('moves task successfully', async () => {
      const mockTask = {
        id: 'task-123',
        columnId: 'new-column-123',
        position: 2,
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTask,
        }),
      })

      const result = await taskService.move('task-123', { 
        columnId: 'new-column-123',
        position: 2 
      })

      expect(result).toEqual(mockTask)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/task-123/move',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ 
            columnId: 'new-column-123',
            position: 2 
          }),
        })
      )
    })
  })

  describe('getByBoard', () => {
    it('gets tasks successfully', async () => {
      const mockTasks = [
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
        {
          id: 'task-2',
          columnId: 'column-2',
          title: 'Task 2',
          description: 'Description',
          position: 0,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTasks,
        }),
      })

      const result = await taskService.getByBoard('board-123')

      expect(result).toEqual(mockTasks)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/boards/board-123/tasks',
        expect.objectContaining({
          method: 'GET',
        })
      )
    })
  })
})

describe('TASK_LIMITS', () => {
  it('has correct limits', () => {
    expect(TASK_LIMITS.TITLE_MIN).toBe(1)
    expect(TASK_LIMITS.TITLE_MAX).toBe(255)
    expect(TASK_LIMITS.DESCRIPTION_MAX).toBe(10000)
    expect(TASK_LIMITS.MAX_TASKS_PER_COLUMN).toBe(100)
  })
})
