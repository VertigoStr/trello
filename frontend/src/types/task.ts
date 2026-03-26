/**
 * Task types for frontend application.
 */

/**
 * Task representation in a column.
 */
export interface Task {
  id: string // UUID
  columnId: string // Column UUID
  title: string // 1-255 characters
  description?: string // 0-10000 characters (optional)
  position: number // Position in column
  assigneeId?: string // User UUID (optional)
  isDeleted: boolean // Soft delete flag
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * Data transfer object for creating a new task.
 */
export interface CreateTaskDTO {
  title: string
  description?: string
  assigneeId?: string
}

/**
 * Data transfer object for updating a task.
 */
export interface UpdateTaskDTO {
  title?: string
  description?: string
  assigneeId?: string
}

/**
 * Data transfer object for moving a task.
 */
export interface MoveTaskDTO {
  columnId: string
  position: number
}

/**
 * Validation limits for tasks.
 */
export const TASK_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
  DESCRIPTION_MAX: 10000,
  MAX_TASKS_PER_COLUMN: 100,
} as const
