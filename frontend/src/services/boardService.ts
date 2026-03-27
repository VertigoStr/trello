/**
 * Board service for API integration.
 */

import type {
  Board,
  CreateBoardDTO,
  UpdateBoardDTO,
  BoardListResponse,
} from '@/types/board'

// Use relative path for production (nginx proxies /api to backend:8000)
// Paths already include /api prefix
const API_BASE = ''

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

  if (!response.ok || data.status === 'error') {
    throw new Error(data.error?.message || data.detail?.message || 'API error')
  }

  // Backend can return data directly or wrapped in {status, data}
  return (data.data || data) as T
}

/**
 * Board service for CRUD operations.
 */
export const boardService = {
  /**
   * Get all boards for the current user.
   */
  async getAll(page = 1, limit = 20): Promise<Board[]> {
    const response = await fetch(
      `${API_BASE}/api/boards?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    )
    
    const data = await response.json()
    
    // Backend returns {boards: [...], pagination: {...}} directly
    if (data.status === 'error') {
      throw new Error(data.error?.message || 'Failed to fetch boards')
    }
    
    return data.boards || []
  },

  /**
   * Create a new board.
   */
  async create(data: CreateBoardDTO): Promise<Board> {
    const response = await fetch(`${API_BASE}/api/boards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Board>(response)
  },

  /**
   * Get board by ID.
   */
  async getById(id: string): Promise<Board> {
    const response = await fetch(`${API_BASE}/api/boards/${id}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse<Board>(response)
  },

  /**
   * Update a board (owner only).
   */
  async update(id: string, data: UpdateBoardDTO): Promise<Board> {
    const response = await fetch(`${API_BASE}/api/boards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Board>(response)
  },

  /**
   * Delete a board (owner only).
   */
  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/boards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },
}
