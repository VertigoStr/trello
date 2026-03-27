/**
 * Task service for API integration.
 */

import type { Task, CreateTaskDTO, UpdateTaskDTO, MoveTaskDTO } from '@/types/task'

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

  if (!response.ok || data.status === 'error') {
    throw new Error(data.error?.message || data.detail?.message || 'API error')
  }

  // Backend can return data directly or wrapped in {status, data}
  return (data.data || data) as T
}

/**
 * Task service for CRUD operations.
 */
export const taskService = {
  /**
   * Create a new task.
   */
  async create(boardId: string, columnId: string, data: CreateTaskDTO): Promise<Task> {
    const response = await fetch(`${API_BASE}/api/boards/${boardId}/columns/${columnId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Task>(response)
  },

  /**
   * Update a task.
   */
  async update(taskId: string, data: UpdateTaskDTO): Promise<Task> {
    const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Task>(response)
  },

  /**
   * Delete a task.
   */
  async delete(taskId: string): Promise<void> {
    await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },

  /**
   * Move a task to a new column/position.
   */
  async move(taskId: string, data: MoveTaskDTO): Promise<Task> {
    const response = await fetch(`${API_BASE}/api/tasks/${taskId}/move`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Task>(response)
  },

  /**
   * Get all tasks for a board.
   */
  async getByBoard(boardId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/api/boards/${boardId}/tasks`, {
      headers: getAuthHeaders(),
    })
    return handleResponse<Task[]>(response)
  },
}
