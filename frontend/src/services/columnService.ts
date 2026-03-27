/**
 * Column service for API integration.
 */

import type { Column, CreateColumnDTO, UpdateColumnDTO } from '@/types/column'

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

/**
 * Get authentication headers.
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

/**
 * Handle API response and errors.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.error.message)
  }

  // Backend can return data directly or wrapped in {status, data}
  return data.data || data
}

/**
 * Column service for CRUD operations.
 */
export const columnService = {
  /**
   * Create a new column.
   */
  async create(boardId: string, data: CreateColumnDTO): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/boards/${boardId}/columns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Column>(response)
  },

  /**
   * Update a column (owner only).
   */
  async update(columnId: string, data: UpdateColumnDTO): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/columns/${columnId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Column>(response)
  },

  /**
   * Delete a column (owner only).
   */
  async delete(columnId: string): Promise<void> {
    await fetch(`${API_BASE}/api/columns/${columnId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },

  /**
   * Move a column to a new position.
   */
  async move(columnId: string, newPosition: number): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/columns/${columnId}/move`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ position: newPosition }),
    })
    return handleResponse<Column>(response)
  },

  /**
   * Get all columns for a board.
   */
  async getByBoard(boardId: string): Promise<Column[]> {
    const response = await fetch(`${API_BASE}/api/boards/${boardId}/columns`, {
      headers: getAuthHeaders(),
    })
    const data = await response.json()
    if (data.status === 'error') {
      throw new Error(data.error.message)
    }
    return data.data || []
  },
}
