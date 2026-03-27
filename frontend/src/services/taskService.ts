/**
 * Task service for API integration.
 */

import type { Task, CreateTaskDTO, UpdateTaskDTO, MoveTaskDTO } from '@/types/task'

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
    // Convert camelCase to snake_case for backend
    const requestBody = {
      column_id: data.columnId,
      position: data.position,
    }
    const response = await fetch(`${API_BASE}/api/tasks/${taskId}/move`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
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
    const data = await response.json()
    // Backend returns { tasks: [...], pagination: {...} }
    const tasks = (data.tasks || data) as any[]
    // Convert snake_case to camelCase
    return tasks.map(t => ({
      ...t,
      columnId: t.column_id,
      assigneeId: t.assignee_id,
      isDeleted: t.is_deleted,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })) as Task[]
  },
}
