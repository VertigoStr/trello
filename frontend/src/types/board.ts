/**
 * Board types for frontend application.
 */

/**
 * Board status enumeration.
 */
export const BOARD_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export type BoardStatus = typeof BOARD_STATUS[keyof typeof BOARD_STATUS]

/**
 * Board member roles.
 */
export const BOARD_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type BoardRole = typeof BOARD_ROLES[keyof typeof BOARD_ROLES]

/**
 * Board representation in the application.
 */
export interface Board {
  id: string // UUID
  title: string // 1-255 characters
  description?: string // 0-10000 characters (optional)
  ownerId: string // UUID
  status: BoardStatus
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * Board member with role and permissions.
 */
export interface BoardMember {
  id: string // UUID
  boardId: string // UUID
  userId: string // UUID
  role: BoardRole
  permissions: string[] // ['read', 'write', 'delete']
  createdAt: string // ISO 8601 timestamp
}

/**
 * Data transfer object for creating a new board.
 */
export interface CreateBoardDTO {
  title: string
  description?: string
}

/**
 * Data transfer object for updating a board.
 */
export interface UpdateBoardDTO {
  title?: string
  description?: string
}

/**
 * Board list response with pagination.
 */
export interface BoardListResponse {
  boards: Board[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

/**
 * Validation limits for board fields.
 */
export const BOARD_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
  DESCRIPTION_MAX: 10000,
} as const
