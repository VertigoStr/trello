/**
 * Tests for column service and validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { columnService } from '@/services/columnService'
import { COLUMN_LIMITS } from '@/types/column'

describe('columnService', () => {
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
    it('creates column successfully', async () => {
      const mockColumn = {
        id: 'column-123',
        boardId: 'board-123',
        title: 'Test Column',
        position: 0,
        createdAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockColumn,
        }),
      })

      const result = await columnService.create('board-123', { title: 'Test Column' })

      expect(result).toEqual(mockColumn)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/boards/board-123/columns',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({ title: 'Test Column' }),
        })
      )
    })

    it('handles API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'error',
          error: {
            code: 'ACCESS_DENIED',
            message: 'You do not have access to this board',
          },
        }),
      })

      await expect(columnService.create('board-123', { title: 'Test' }))
        .rejects.toThrow('You do not have access to this board')
    })
  })

  describe('update', () => {
    it('updates column successfully', async () => {
      const mockColumn = {
        id: 'column-123',
        title: 'Updated Column',
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockColumn,
        }),
      })

      const result = await columnService.update('column-123', { title: 'Updated Column' })

      expect(result).toEqual(mockColumn)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/columns/column-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Column' }),
        })
      )
    })
  })

  describe('delete', () => {
    it('deletes column successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      await columnService.delete('column-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/columns/column-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('move', () => {
    it('moves column successfully', async () => {
      const mockColumn = {
        id: 'column-123',
        position: 2,
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockColumn,
        }),
      })

      const result = await columnService.move('column-123', 2)

      expect(result).toEqual(mockColumn)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/columns/column-123/move',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ position: 2 }),
        })
      )
    })
  })

  describe('getByBoard', () => {
    it('gets columns successfully', async () => {
      const mockColumns = [
        {
          id: 'column-1',
          boardId: 'board-123',
          title: 'To Do',
          position: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'column-2',
          boardId: 'board-123',
          title: 'Done',
          position: 1,
          createdAt: new Date().toISOString(),
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockColumns,
        }),
      })

      const result = await columnService.getByBoard('board-123')

      expect(result).toEqual(mockColumns)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/boards/board-123/columns',
        expect.objectContaining({
          method: 'GET',
        })
      )
    })
  })
})

describe('COLUMN_LIMITS', () => {
  it('has correct limits', () => {
    expect(COLUMN_LIMITS.TITLE_MIN).toBe(1)
    expect(COLUMN_LIMITS.TITLE_MAX).toBe(255)
    expect(COLUMN_LIMITS.MAX_COLUMNS_PER_BOARD).toBe(20)
  })
})
