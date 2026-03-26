# Data Models: Frontend Columns and Tasks

**Feature**: 007-board-columns-tasks
**Date**: 2026-03-26
**Purpose**: TypeScript типы и интерфейсы для колонок и задач

---

## Type: Column

**Description**: Колонка на доске для организации задач.

### Fields

```typescript
interface Column {
  id: string           // UUID
  boardId: string      // UUID доски
  title: string        // 1-255 символов
  position: number     // Позиция в доске
  createdAt: string    // ISO 8601 timestamp
  updatedAt?: string   // ISO 8601 timestamp (optional)
}
```

### Validation Rules

- title: 1-255 символов, обязательное поле
- position: >= 0, уникально в рамках доски

---

## Type: Task

**Description**: Задача в колонке доски.

### Fields

```typescript
interface Task {
  id: string           // UUID
  columnId: string     // UUID колонки
  title: string        // 1-255 символов
  description?: string // 0-10000 символов (опционально)
  position: number     // Позиция в колонке
  assigneeId?: string  // UUID исполнителя (опционально)
  isDeleted: boolean   // Флаг soft delete
  createdAt: string    // ISO 8601 timestamp
  updatedAt: string    // ISO 8601 timestamp
}
```

### Validation Rules

- title: 1-255 символов, обязательное поле
- description: 0-10000 символов, опционально
- position: >= 0, уникально в рамках колонки

---

## Type: CreateColumnDTO

**Description**: Данные для создания новой колонки.

### Fields

```typescript
interface CreateColumnDTO {
  title: string
}
```

### Validation

```typescript
function validateCreateColumn(data: CreateColumnDTO): Record<string, string> {
  const errors: Record<string, string> = {}
  
  if (!data.title || !data.title.trim()) {
    errors.title = 'Название обязательно'
  }
  
  if (data.title && data.title.length > 255) {
    errors.title = 'Название не более 255 символов'
  }
  
  return errors
}
```

---

## Type: UpdateColumnDTO

**Description**: Данные для редактирования колонки.

### Fields

```typescript
interface UpdateColumnDTO {
  title?: string
}
```

---

## Type: CreateTaskDTO

**Description**: Данные для создания новой задачи.

### Fields

```typescript
interface CreateTaskDTO {
  title: string
  description?: string
  assigneeId?: string
}
```

### Validation

```typescript
function validateCreateTask(data: CreateTaskDTO): Record<string, string> {
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

## Type: UpdateTaskDTO

**Description**: Данные для редактирования задачи.

### Fields

```typescript
interface UpdateTaskDTO {
  title?: string
  description?: string
  assigneeId?: string
}
```

---

## Type: MoveTaskDTO

**Description**: Данные для перемещения задачи.

### Fields

```typescript
interface MoveTaskDTO {
  columnId: string
  position: number
}
```

---

## Type: Board State

**Description**: Состояние доски с колонками и задачами.

### Fields

```typescript
interface BoardState {
  board: Board | null
  columns: Column[]
  tasks: Record<string, Task[]>  // columnId -> tasks
  loading: boolean
  error: string | null
}
```

### State Transitions

```typescript
// Initial
{ board: null, columns: [], tasks: {}, loading: true, error: null }

// Loading
{ board: null, columns: [], tasks: {}, loading: true, error: null }

// Loaded
{ board: Board, columns: Column[], tasks: {...}, loading: false, error: null }

// Error
{ board: null, columns: [], tasks: {}, loading: false, error: 'Failed to load' }
```

---

## Type: API Responses

**Description**: Типы для ответов backend API.

### Fields

```typescript
// Success response
interface SuccessResponse<T> {
  status: 'success'
  data: T
}

// Error response
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
type ColumnListApiResponse = ApiResponse<Column[]>
type TaskListApiResponse = ApiResponse<Task[]>
type CreateColumnApiResponse = ApiResponse<Column>
type CreateTaskApiResponse = ApiResponse<Task>
type MoveTaskApiResponse = ApiResponse<Task>
```

---

## Constants

```typescript
// Validation limits
export const COLUMN_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
} as const

export const TASK_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 255,
  DESCRIPTION_MAX: 10000,
} as const

// Error codes
export const ERROR_CODES = {
  ACCESS_DENIED: 'ACCESS_DENIED',
  BOARD_NOT_FOUND: 'BOARD_NOT_FOUND',
  COLUMN_NOT_FOUND: 'COLUMN_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const
```

---

## Error Messages

```typescript
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.ACCESS_DENIED]: 'У вас нет доступа к этой доске',
  [ERROR_CODES.COLUMN_NOT_FOUND]: 'Колонка не найдена',
  [ERROR_CODES.TASK_NOT_FOUND]: 'Задача не найдена',
  [ERROR_CODES.VALIDATION_ERROR]: 'Ошибка валидации данных',
  'TITLE_REQUIRED': 'Название обязательно',
  'TITLE_TOO_LONG': 'Название не более 255 символов',
  'DESCRIPTION_TOO_LONG': 'Описание не более 10000 символов',
} as const
```
