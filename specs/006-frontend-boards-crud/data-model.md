# Data Models: Frontend Boards

**Feature**: 006-frontend-boards-crud
**Date**: 2026-03-26
**Purpose**: TypeScript типы и интерфейсы для досок

---

## Type: Board

**Description**: Доска — основное рабочее пространство для организации задач.

### Fields

```typescript
interface Board {
  id: string           // UUID
  title: string        // 1-255 символов
  description?: string // 0-10000 символов (опционально)
  ownerId: string      // UUID владельца
  status: 'active' | 'archived'
  createdAt: string    // ISO 8601 timestamp
  updatedAt: string    // ISO 8601 timestamp
}
```

### Validation Rules

- title: 1-255 символов, обязательное поле
- description: 0-10000 символов, опционально
- status: 'active' или 'archived'

---

## Type: BoardMember

**Description**: Участник доски с ролью и правами доступа.

### Fields

```typescript
interface BoardMember {
  id: string        // UUID
  boardId: string   // UUID доски
  userId: string    // UUID пользователя
  role: 'owner' | 'admin' | 'member'
  permissions: string[] // ['read', 'write', 'delete']
  createdAt: string // ISO 8601 timestamp
}
```

### Role Permissions

| Role | Permissions |
|------|-------------|
| owner | read, write, delete (все права) |
| admin | read, write (управление задачами/колонками) |
| member | read (только просмотр, можно расширить) |

---

## Type: CreateBoardDTO

**Description**: Данные для создания новой доски.

### Fields

```typescript
interface CreateBoardDTO {
  title: string
  description?: string
}
```

### Validation

```typescript
function validateCreateBoard(data: CreateBoardDTO): Record<string, string> {
  const errors: Record<string, string> = {}
  
  if (!data.title || !data.title.trim()) {
    errors.title = 'Название обязательно'
  }
  
  if (data.title && data.title.length > 255) {
    errors.title = 'Название не более 255 символов'
  }
  
  if (data.description && data.description.length > 10000) {
    errors.description = 'Описание не более 10000 символов'
  }
  
  return errors
}
```

---

## Type: UpdateBoardDTO

**Description**: Данные для редактирования доски.

### Fields

```typescript
interface UpdateBoardDTO {
  title?: string
  description?: string
}
```

### Validation

```typescript
function validateUpdateBoard(data: UpdateBoardDTO): Record<string, string> {
  const errors: Record<string, string> = {}
  
  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.title = 'Название обязательно'
    }
    if (data.title.length > 255) {
      errors.title = 'Название не более 255 символов'
    }
  }
  
  if (data.description !== undefined && data.description.length > 10000) {
    errors.description = 'Описание не более 10000 символов'
  }
  
  return errors
}
```

---

## Type: BoardListResponse

**Description**: Ответ API для списка досок с пагинацией.

### Fields

```typescript
interface BoardListResponse {
  boards: Board[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
```

---

## Type: BoardState

**Description**: Состояние управления досками в приложении.

### Fields

```typescript
interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
}
```

### State Transitions

```typescript
// Initial
{ boards: [], currentBoard: null, loading: false, error: null }

// Loading boards
{ boards: [], currentBoard: null, loading: true, error: null }

// Boards loaded
{ boards: Board[], currentBoard: null, loading: false, error: null }

// Error
{ boards: [], currentBoard: null, loading: false, error: 'Failed to load' }
```

---

## Type: API Responses

**Description**: Типы для ответов backend API.

### Fields

```typescript
// Успешный ответ
interface SuccessResponse<T> {
  status: 'success'
  data: T
}

// Ошибка
interface ErrorResponse {
  status: 'error'
  error: {
    code: string
    message: string
    details?: any[]
  }
}

// Union type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
```

### Specific Responses

```typescript
type BoardListApiResponse = ApiResponse<BoardListResponse>
type BoardDetailApiResponse = ApiResponse<Board>
type CreateBoardApiResponse = ApiResponse<Board>
type UpdateBoardApiResponse = ApiResponse<Board>
type DeleteBoardApiResponse = ApiResponse<{ message: string }>
```

---

## Constants

```typescript
// Board status
export const BOARD_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

// Board member roles
export const BOARD_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

// Permissions
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
} as const

// Validation limits
export const BOARD_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
  DESCRIPTION_MAX: 10000,
} as const

// Error codes
export const ERROR_CODES = {
  ACCESS_DENIED: 'ACCESS_DENIED',
  BOARD_NOT_FOUND: 'BOARD_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  OWNER_ONLY: 'OWNER_ONLY',
} as const
```

---

## Error Messages

```typescript
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.ACCESS_DENIED]: 'У вас нет доступа к этой доске',
  [ERROR_CODES.BOARD_NOT_FOUND]: 'Доска не найдена',
  [ERROR_CODES.VALIDATION_ERROR]: 'Ошибка валидации данных',
  [ERROR_CODES.OWNER_ONLY]: 'Только владелец может выполнить это действие',
  'TITLE_REQUIRED': 'Название обязательно',
  'TITLE_TOO_LONG': 'Название не более 255 символов',
  'DESCRIPTION_TOO_LONG': 'Описание не более 10000 символов',
} as const
```
