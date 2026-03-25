# Data Model: Task Management API

**Feature**: 004-create-tasks-boards
**Date**: 2026-03-25
**Purpose**: Models and entities for task management

---

## Entity: Task (существует в 003-task-boards-crud)

**Description**: Задача в колонке доски — основная единица работы.

### Fields (существующие)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Уникальный идентификатор задачи |
| column_id | UUID | FOREIGN KEY → columns.id, NOT NULL | Колонка |
| title | VARCHAR(255) | NOT NULL | Название задачи (1-255 символов) |
| description | TEXT | NULL | Описание задачи (до 10000 символов) |
| position | FLOAT | NOT NULL | Позиция в списке задач (float для вставки) |
| assignee_id | UUID | FOREIGN KEY → users.id, NULL | Исполнитель задачи |
| is_deleted | BOOLEAN | DEFAULT FALSE | Флаг soft delete |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата создания |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата обновления |
| version | INTEGER | DEFAULT 1 | Версия для optimistic locking |

### Indexes (существующие + новые)

- `idx_tasks_column_id` — для поиска задач колонки (существует)
- `idx_tasks_assignee_id` — для поиска задач исполнителя (существует)
- `idx_tasks_position` — для сортировки по позиции (существует)
- `idx_tasks_is_deleted` — для фильтрации удалённых (существует)
- `idx_tasks_version` — для optimistic locking (новый)

### Validation Rules

- title: 1-255 символов, не пустое
- description: 0-10000 символов (опционально)
- position: >= 0, float значение
- assignee_id: должен быть участником доски (если указан)

---

## Entity: Column (существует в 003-task-boards-crud)

**Description**: Колонка на доске для группировки задач.

### Fields (существующие)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Уникальный идентификатор колонки |
| board_id | UUID | FOREIGN KEY → boards.id, NOT NULL | Доска |
| title | VARCHAR(255) | NOT NULL | Название колонки |
| position | FLOAT | NOT NULL | Позиция в списке колонок |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата создания |

### Indexes (существующие)

- `idx_columns_board_id` — для поиска колонок доски (существует)
- `idx_columns_position` — для сортировки по позиции (существует)

---

## Relationships

```text
Board (1) ──< Column (N)
  │            └── board_id FK
  │
  └── Board (1) ──< Task (N)
                     └── через Column

Column (1) ──< Task (N)
  │            └── column_id FK
  │
  └── users (1) ──< Task (N)
                     └── assignee_id FK (NULLable)
```

---

## State Transitions

### Task Lifecycle

```text
[created] ──update──> [updated]
    │                     │
    └─────delete (soft)──> [deleted]
```

### Task Movement (Column Changes)

```text
[Column A] ──move──> [Column B]
     │                   │
     └─────reorder───────┘
```

---

## Permission Rules

### Task Operations

| Operation | Required Permission |
|-----------|---------------------|
| View task | read (на доске) |
| Create task | write (на доске) |
| Update task (своя) | assignee (независимо от роли) |
| Update task (чужая) | write (на доске) |
| Move task | write (на доске) |
| Delete task | delete (на доске) |
| Assign task | write (на доске) |
| Unassign self | assignee (независимо от роли) |

---

## Optimistic Locking

### Version Field

- **Purpose**: Обнаружение конфликтов при одновременном редактировании
- **Type**: INTEGER
- **Default**: 1
- **Increment**: Auto-increment на каждое UPDATE
- **Validation**: WHERE version = :old_version на UPDATE

### Conflict Detection

```python
# Пример UPDATE с optimistic locking
UPDATE tasks 
SET title = :new_title, 
    updated_at = NOW(),
    version = version + 1
WHERE id = :task_id 
  AND version = :current_version

# Если rows affected = 0 → конфликт (кто-то обновил раньше)
```

### Client Protocol

```
GET /api/tasks/{id}
Response: ETag: "5"  # version в ETag

PUT /api/tasks/{id}
If-Match: "5"  # client отправляет known version

# Если version изменилась → 412 Precondition Failed
```

---

## Cascade Delete Rules

1. **Delete Column**:
   - CASCADE: Tasks (физическое удаление)

2. **Delete Board**:
   - CASCADE: Columns
   - CASCADE: Tasks (через Columns)

3. **Delete User**:
   - SET NULL: Task.assignee_id

---

## Existing Model Compatibility

**Модель Task уже существует в 003-task-boards-crud**:
- Все поля уже определены
- Soft delete уже реализован (is_deleted)
- Отношения уже настроены (column_id FK)

**Требуемые изменения**:
- Добавить поле `version` для optimistic locking
- Добавить индекс `idx_tasks_version`

**Миграция**:
```sql
ALTER TABLE tasks ADD COLUMN version INTEGER DEFAULT 1;
CREATE INDEX idx_tasks_version ON tasks(version);
```
