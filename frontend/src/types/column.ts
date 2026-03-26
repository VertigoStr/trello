/**
 * Column types for frontend application.
 */

/**
 * Column representation on a board.
 */
export interface Column {
  id: string // UUID
  boardId: string // Board UUID
  title: string // 1-255 characters
  position: number // Position in board
  createdAt: string // ISO 8601 timestamp
  updatedAt?: string // ISO 8601 timestamp (optional)
}

/**
 * Data transfer object for creating a new column.
 */
export interface CreateColumnDTO {
  title: string
}

/**
 * Data transfer object for updating a column.
 */
export interface UpdateColumnDTO {
  title?: string
}

/**
 * Validation limits for columns.
 */
export const COLUMN_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
  MAX_COLUMNS_PER_BOARD: 20,
} as const
