# API Contract: Task Management Endpoints

**Feature**: 004-create-tasks-boards
**Date**: 2026-03-25
**Purpose**: Contract specification for task CRUD API endpoints

---

## Base URL

```
/api/boards/{board_id}/tasks
```

## Content Type

```
Content-Type: application/json
```

## Authentication

Все endpoints требуют JWT аутентификации:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoint 1: Create Task

**Purpose**: Создание новой задачи в колонке доски.

### Request

```http
POST /api/boards/{board_id}/columns/{column_id}/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Новая задача",
  "description": "Описание задачи (опционально)",
  "assignee_id": "user-uuid (опционально)"
}
```

### Request Schema

```json
{
  "type": "object",
  "required": ["title"],
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255,
      "description": "Название задачи"
    },
    "description": {
      "type": "string",
      "maxLength": 10000,
      "description": "Описание задачи"
    },
    "assignee_id": {
      "type": "string",
      "format": "uuid",
      "description": "UUID исполнителя (должен быть участником доски)"
    }
  }
}
```

### Response: 201 Created

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "column_id": "column-uuid",
    "title": "Новая задача",
    "description": "Описание задачи",
    "assignee_id": "user-uuid",
    "position": 1.5,
    "is_deleted": false,
    "created_at": "2026-03-25T10:00:00Z",
    "updated_at": "2026-03-25T10:00:00Z",
    "version": 1
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

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have write permission on this board"
  }
}
```

### Response: 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "COLUMN_NOT_FOUND",
    "message": "Column not found"
  }
}
```

---

## Endpoint 2: List Tasks

**Purpose**: Получение списка всех задач доски.

### Request

```http
GET /api/boards/{board_id}/tasks?page=1&limit=20&column_id=xxx
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Номер страницы |
| limit | integer | 20 | Количество на странице (1-100) |
| column_id | string (UUID) | all | Фильтр по колонке |
| assignee_id | string (UUID) | all | Фильтр по исполнителю |

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "tasks": [
      {
        "id": "task-uuid-1",
        "column_id": "column-uuid-1",
        "title": "Задача 1",
        "description": "Описание",
        "assignee_id": "user-uuid",
        "position": 1.0,
        "created_at": "2026-03-25T10:00:00Z",
        "updated_at": "2026-03-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

---

## Endpoint 3: Get Task

**Purpose**: Получение детальной информации о задаче.

### Request

```http
GET /api/tasks/{task_id}
Authorization: Bearer <token>

If-None-Match: "5"  # ETag (опционально)
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "column_id": "column-uuid",
    "title": "Задача",
    "description": "Описание",
    "assignee_id": "user-uuid",
    "position": 1.0,
    "created_at": "2026-03-25T10:00:00Z",
    "updated_at": "2026-03-25T10:00:00Z",
    "version": 5
  }
}
```

### Response Headers

```
ETag: "5"  # version задачи
```

### Response: 304 Not Modified

```
(Empty body, если If-None-Match совпадает с ETag)
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have access to this task"
  }
}
```

### Response: 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

## Endpoint 4: Update Task

**Purpose**: Редактирование задачи.

### Request

```http
PUT /api/tasks/{task_id}
Content-Type: application/json
Authorization: Bearer <token>

If-Match: "5"  # ETag (обязательно для optimistic locking)

{
  "title": "Обновлённое название",
  "description": "Новое описание",
  "assignee_id": "new-user-uuid"
}
```

### Request Schema

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "description": {
      "type": "string",
      "maxLength": 10000
    },
    "assignee_id": {
      "type": ["string", "null"],
      "format": "uuid"
    }
  }
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "title": "Обновлённое название",
    "description": "Новое описание",
    "assignee_id": "new-user-uuid",
    "updated_at": "2026-03-25T14:00:00Z",
    "version": 6
  }
}
```

### Response Headers

```
ETag: "6"  # новая версия
```

### Response: 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be 1-255 characters",
    "details": [...]
  }
}
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to edit this task"
  }
}
```

### Response: 412 Precondition Failed (Optimistic Lock Conflict)

```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "Task was modified by another user. Please refresh and try again.",
    "current_version": 7,
    "current_data": {
      "title": "Другие изменения",
      "description": "Изменено другим пользователем",
      "updated_at": "2026-03-25T13:55:00Z"
    }
  }
}
```

---

## Endpoint 5: Move Task

**Purpose**: Перемещение задачи в другую колонку/позицию.

### Request

```http
POST /api/tasks/{task_id}/move
Content-Type: application/json
Authorization: Bearer <token>

{
  "column_id": "new-column-uuid",
  "position": 2.5
}
```

### Request Schema

```json
{
  "type": "object",
  "required": ["column_id"],
  "properties": {
    "column_id": {
      "type": "string",
      "format": "uuid",
      "description": "Целевая колонка"
    },
    "position": {
      "type": "number",
      "minimum": 0,
      "description": "Позиция в целевой колонке (опционально, по умолчанию в конец)"
    }
  }
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "column_id": "new-column-uuid",
    "position": 2.5,
    "updated_at": "2026-03-25T15:00:00Z",
    "version": 8
  }
}
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to move tasks on this board"
  }
}
```

### Response: 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "COLUMN_NOT_FOUND",
    "message": "Target column not found"
  }
}
```

---

## Endpoint 6: Delete Task

**Purpose**: Удаление задачи (soft delete).

### Request

```http
DELETE /api/tasks/{task_id}
Authorization: Bearer <token>
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
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to delete tasks on this board"
  }
}
```

### Response: 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

## Endpoint 7: Unassign Self

**Purpose**: Снять с себя задачу (для исполнителя).

### Request

```http
POST /api/tasks/{task_id}/unassign
Authorization: Bearer <token>
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "assignee_id": null,
    "updated_at": "2026-03-25T16:00:00Z"
  }
}
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You are not the assignee of this task"
  }
}
```

---

## Error Response Format

### Standard Error Schema

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["error"]
    },
    "error": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string",
          "description": "Машинный код ошибки"
        },
        "message": {
          "type": "string",
          "description": "Читаемое описание ошибки"
        },
        "details": {
          "type": ["object", "array"],
          "description": "Дополнительные детали (опционально)"
        },
        "current_version": {
          "type": "integer",
          "description": "Текущая версия (для 412 Conflict)"
        },
        "current_data": {
          "type": "object",
          "description": "Текущие данные (для 412 Conflict)"
        }
      }
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Ошибка валидации входных данных |
| ACCESS_DENIED | 403 | Нет доступа к задаче/доске |
| TASK_NOT_FOUND | 404 | Задача не найдена |
| COLUMN_NOT_FOUND | 404 | Колонка не найдена |
| CONFLICT | 412 | Конфликт версий (optimistic locking) |
| UNAUTHORIZED | 401 | Требуется аутентификация |
| INTERNAL_ERROR | 500 | Внутренняя ошибка сервера |

---

## Security Requirements

1. **Authentication**: Все endpoints требуют JWT токен
2. **Authorization**: Проверка прав доступа для каждой операции
3. **Optimistic Locking**: ETag/If-Match для UPDATE операций
4. **Input Validation**: Валидация всех входных данных
5. **Rate Limiting**: Ограничение количества запросов
