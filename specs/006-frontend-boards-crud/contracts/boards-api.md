# API Contracts: Boards Backend Integration

**Feature**: 006-frontend-boards-crud
**Date**: 2026-03-26
**Purpose**: Контракты для интеграции с 003-task-boards-crud backend

---

## Base Configuration

**Base URL**: `http://localhost:8000` (development)
**Content-Type**: `application/json`
**Authentication**: Bearer token в заголовке `Authorization`

---

## Endpoint 1: List Boards

**Purpose**: Получение списка всех досок пользователя.

### Request

```http
GET /api/boards?page=1&limit=20
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Номер страницы |
| limit | integer | 20 | Количество на странице (1-100) |

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "boards": [
      {
        "id": "board-uuid-1",
        "title": "Моя доска",
        "description": "Описание доски",
        "owner_id": "user-uuid",
        "status": "active",
        "created_at": "2026-03-25T10:00:00Z",
        "updated_at": "2026-03-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

## Endpoint 2: Create Board

**Purpose**: Создание новой доски.

### Request

```http
POST /api/boards
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Новая доска",
  "description": "Описание новой доски (опционально)"
}
```

### Request Schema

```typescript
interface CreateBoardRequest {
  title: string       // 1-255 characters
  description?: string // 0-10000 characters (optional)
}
```

### Response: 201 Created

```json
{
  "status": "success",
  "data": {
    "id": "board-uuid",
    "title": "Новая доска",
    "description": "Описание новой доски",
    "owner_id": "user-uuid",
    "status": "active",
    "created_at": "2026-03-26T10:00:00Z",
    "updated_at": "2026-03-26T10:00:00Z"
  }
}
```

### Response: 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be 1-255 characters",
    "details": [...]
  }
}
```

---

## Endpoint 3: Get Board Details

**Purpose**: Получение детальной информации о доске.

### Request

```http
GET /api/boards/{board_id}
Authorization: Bearer {token}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "board-uuid",
    "title": "Моя доска",
    "description": "Описание",
    "owner_id": "user-uuid",
    "status": "active",
    "created_at": "2026-03-25T10:00:00Z",
    "updated_at": "2026-03-25T10:00:00Z",
    "members_count": 3,
    "columns_count": 4,
    "tasks_count": 15
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

### Response: 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "BOARD_NOT_FOUND",
    "message": "Board not found"
  }
}
```

---

## Endpoint 4: Update Board

**Purpose**: Редактирование настроек доски (только владелец).

### Request

```http
PUT /api/boards/{board_id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Обновлённое название",
  "description": "Новое описание"
}
```

### Request Schema

```typescript
interface UpdateBoardRequest {
  title?: string       // 1-255 characters
  description?: string // 0-10000 characters
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "board-uuid",
    "title": "Обновлённое название",
    "description": "Новое описание",
    "updated_at": "2026-03-26T14:00:00Z"
  }
}
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "OWNER_ONLY",
    "message": "Only board owner can update board settings"
  }
}
```

---

## Endpoint 5: Delete Board

**Purpose**: Удаление доски со всеми связанными данными (только владелец).

### Request

```http
DELETE /api/boards/{board_id}
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
    "message": "Only board owner can delete the board"
  }
}
```

### Response: 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "BOARD_NOT_FOUND",
    "message": "Board not found"
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
| BOARD_NOT_FOUND | 404 | Доска не найдена |
| OWNER_ONLY | 403 | Требуется роль владельца |
| UNAUTHORIZED | 401 | Требуется аутентификация |
| INTERNAL_ERROR | 500 | Внутренняя ошибка сервера |

---

## Frontend Integration Example

```typescript
// services/boardService.ts

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const boardService = {
  async getAll(page = 1, limit = 20): Promise<Board[]> {
    const response = await fetch(
      `${API_BASE}/api/boards?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    )
    const data = await response.json()
    return data.data?.boards || []
  },

  async create(data: CreateBoardDTO): Promise<Board> {
    const response = await fetch(`${API_BASE}/api/boards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.data
  },

  async getById(id: string): Promise<Board> {
    const response = await fetch(`${API_BASE}/api/boards/${id}`, {
      headers: getAuthHeaders(),
    })
    const data = await response.json()
    return data.data
  },

  async update(id: string, data: UpdateBoardDTO): Promise<Board> {
    const response = await fetch(`${API_BASE}/api/boards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.data
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/boards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },
}
```
