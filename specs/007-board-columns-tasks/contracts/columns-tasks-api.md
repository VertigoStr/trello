# API Contracts: Columns and Tasks Backend Integration

**Feature**: 007-board-columns-tasks
**Date**: 2026-03-26
**Purpose**: Контракты для интеграции с 003-task-boards-crud backend

---

## Base Configuration

**Base URL**: `http://localhost:8000` (development)
**Content-Type**: `application/json`
**Authentication**: Bearer token в заголовке `Authorization`

---

## Endpoint 1: Create Column

**Purpose**: Создание новой колонки на доске.

### Request

```http
POST /api/boards/{board_id}/columns
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "To Do"
}
```

### Request Schema

```typescript
interface CreateColumnRequest {
  title: string  // 1-255 characters
}
```

### Response: 201 Created

```json
{
  "status": "success",
  "data": {
    "id": "column-uuid",
    "board_id": "board-uuid",
    "title": "To Do",
    "position": 0,
    "created_at": "2026-03-26T10:00:00Z"
  }
}
```

### Response: 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be 1-255 characters"
  }
}
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have access to this board"
  }
}
```

---

## Endpoint 2: Update Column

**Purpose**: Редактирование колонки (только владелец).

### Request

```http
PUT /api/columns/{column_id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "In Progress"
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "column-uuid",
    "title": "In Progress",
    "updated_at": "2026-03-26T14:00:00Z"
  }
}
```

---

## Endpoint 3: Delete Column

**Purpose**: Удаление колонки со всеми задачами (только владелец).

### Request

```http
DELETE /api/columns/{column_id}
Authorization: Bearer {token}
```

### Response: 204 No Content

```
(Empty response body)
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "OWNER_ONLY",
    "message": "Only board owner can delete columns"
  }
}
```

---

## Endpoint 4: Move Column

**Purpose**: Перемещение колонки на новую позицию.

### Request

```http
PUT /api/columns/{column_id}/move
Content-Type: application/json
Authorization: Bearer {token}

{
  "position": 2
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "column-uuid",
    "position": 2,
    "updated_at": "2026-03-26T14:00:00Z"
  }
}
```

---

## Endpoint 5: Create Task

**Purpose**: Создание новой задачи в колонке.

### Request

```http
POST /api/columns/{column_id}/tasks
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "New Task",
  "description": "Task description (optional)",
  "assignee_id": "user-uuid (optional)"
}
```

### Request Schema

```typescript
interface CreateTaskRequest {
  title: string        // 1-255 characters
  description?: string // 0-10000 characters
  assignee_id?: string // UUID
}
```

### Response: 201 Created

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "column_id": "column-uuid",
    "title": "New Task",
    "description": "Task description",
    "position": 0,
    "assignee_id": "user-uuid",
    "is_deleted": false,
    "created_at": "2026-03-26T10:00:00Z",
    "updated_at": "2026-03-26T10:00:00Z"
  }
}
```

---

## Endpoint 6: Update Task

**Purpose**: Редактирование задачи.

### Request

```http
PUT /api/tasks/{task_id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "updated_at": "2026-03-26T14:00:00Z"
  }
}
```

---

## Endpoint 7: Delete Task

**Purpose**: Удаление задачи (soft delete).

### Request

```http
DELETE /api/tasks/{task_id}
Authorization: Bearer {token}
```

### Response: 204 No Content

```
(Empty response body)
```

---

## Endpoint 8: Move Task

**Purpose**: Перемещение задачи в другую колонку/позицию.

### Request

```http
PUT /api/tasks/{task_id}/move
Content-Type: application/json
Authorization: Bearer {token}

{
  "column_id": "new-column-uuid",
  "position": 2
}
```

### Request Schema

```typescript
interface MoveTaskRequest {
  column_id: string  // Target column UUID
  position: number   // New position in column
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "column_id": "new-column-uuid",
    "position": 2,
    "updated_at": "2026-03-26T14:00:00Z"
  }
}
```

---

## Error Response Format

### Standard Error Schema

```typescript
interface ApiError {
  status: 'error'
  error: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Ошибка валидации входных данных |
| ACCESS_DENIED | 403 | Нет доступа к доске |
| OWNER_ONLY | 403 | Требуется роль владельца |
| COLUMN_NOT_FOUND | 404 | Колонка не найдена |
| TASK_NOT_FOUND | 404 | Задача не найдена |
| UNAUTHORIZED | 401 | Требуется аутентификация |
| INTERNAL_ERROR | 500 | Внутренняя ошибка сервера |

---

## Frontend Integration Example

```typescript
// services/columnService.ts

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.error.message)
  }

  return data.data
}

export const columnService = {
  async create(boardId: string, data: CreateColumnDTO): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/boards/${boardId}/columns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Column>(response)
  },

  async update(columnId: string, data: UpdateColumnDTO): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/columns/${columnId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Column>(response)
  },

  async delete(columnId: string): Promise<void> {
    await fetch(`${API_BASE}/api/columns/${columnId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },

  async move(columnId: string, newPosition: number): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/columns/${columnId}/move`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ position: newPosition }),
    })
    return handleResponse<Column>(response)
  },
}
```

```typescript
// services/taskService.ts

export const taskService = {
  async create(columnId: string, data: CreateTaskDTO): Promise<Task> {
    const response = await fetch(`${API_BASE}/api/columns/${columnId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Task>(response)
  },

  async update(taskId: string, data: UpdateTaskDTO): Promise<Task> {
    const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Task>(response)
  },

  async delete(taskId: string): Promise<void> {
    await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },

  async move(taskId: string, data: MoveTaskDTO): Promise<Task> {
    const response = await fetch(`${API_BASE}/api/tasks/${taskId}/move`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Task>(response)
  },
}
```
