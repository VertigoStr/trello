# Research: Создание задач и привязка к доскам

**Feature**: 004-create-tasks-boards
**Date**: 2026-03-25
**Purpose**: Technical decisions and best practices for task management API

---

## Decision: Optimistic Locking Pattern

**Chosen**: Version-based optimistic locking с ETag

**Rationale**: 
- Поддерживается SQLAlchemy через version_id_col
- Минимальные накладные расходы при отсутствии конфликтов
- Стандартный паттерн для REST API (Etag/If-Match headers)
- Соответствует требованию FR-019 о обработке конфликтов

**Alternatives considered**:
- Pessimistic locking (SELECT FOR UPDATE) — избыточен для веб-интерфейса, блокирует другие запросы
- Field-level locking — излишняя сложность для MVP
- Last-write-wins — потеря данных при конфликтах

**Implementation**:
```python
class Task(BaseModel):
    __mapper_args__ = {
        "version_id_col": "version",
    }
    version: Mapped[int] = mapped_column(Integer, default=1)
```

---

## Decision: Task Position Management

**Chosen**: Float-based position с renumbering

**Rationale**:
- Позволяет вставлять задачи между существующими без пересчёта всех позиций
- Используется в Trello, Asana, других Kanban-системах
- При переполнении precision — периодический rebalancing

**Alternatives considered**:
- Integer positions — требует UPDATE всех последующих задач при вставке
- Linked list — сложно поддерживать целостность при конкурентных операциях

**Implementation**:
```python
# Вставка между position=1.0 и position=2.0
new_position = (1.0 + 2.0) / 2 = 1.5
```

---

## Decision: Assignee Permission Model

**Chosen**: Hybrid permission model с наследованием от доски + exception для assignee

**Rationale**:
- Соответствует clarification #1: исполнитель редактирует независимо от роли
- Сохраняет существующую модель прав из 003-task-boards-crud
- Минимальные изменения в permission_service

**Implementation**:
```python
async def can_edit_task(user_id, task, board_member):
    # Owner/admin всегда могут
    if board_member.role in ["owner", "admin"]:
        return True
    # Assignee может редактировать свою задачу
    if task.assignee_id == user_id:
        return True
    # Member с write permission
    if "write" in board_member.permissions:
        return True
    return False
```

---

## Decision: Task Status via Column

**Chosen**: Status определяется колонкой (не хранится отдельно)

**Rationale**:
- Соответствует clarification #5
- Упрощает модель данных (нет дублирования)
- Перемещение между колонками = изменение статуса
- Соответствует Kanban-методологии

**Alternatives considered**:
- Отдельное поле status — дублирование данных, риск рассинхронизации
- Гибридная модель — излишняя сложность для MVP

---

## Decision: Soft Delete Implementation

**Chosen**: Soft delete через is_deleted флаг с existing моделью из 003

**Rationale**:
- Уже реализовано в модели Task из 003-task-boards-crud
- Позволяет восстановление удалённых задач
- Соответствует Assumptions из spec.md

**Implementation**:
```python
# Фильтрация удалённых задач
select(Task).where(Task.is_deleted == False)
```

---

## Best Practices: Task CRUD API Design

**REST Endpoints**:
```
POST   /api/boards/{board_id}/columns/{column_id}/tasks  # Create
GET    /api/boards/{board_id}/tasks                      # List all
GET    /api/tasks/{task_id}                              # Get one
PUT    /api/tasks/{task_id}                              # Update
DELETE /api/tasks/{task_id}                              # Delete
POST   /api/tasks/{task_id}/move                         # Move to column/position
```

**Request/Response Patterns**:
- Использовать существующие schemas из 003-task-boards-crud
- Pagination для списка задач (page, limit, total)
- ETag header для optimistic locking

---

## Integration Patterns: Existing APIs

**Dependencies**:
- 002-auth-api: JWT authentication, user lookup
- 003-task-boards-crud: Board, Column, BoardMember модели, permission_service

**Integration Points**:
```python
# Импорт существующих сервисов
from src.services.board_service import BoardService
from src.services.permission_service import PermissionService

# Использование существующих моделей
from src.models.board import Board
from src.models.column import Column
from src.models.board_member import BoardMember
from src.models.task import Task  # Уже существует
```

---

## Database Considerations

**Indexes for Task queries**:
```sql
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_tasks_is_deleted ON tasks(is_deleted);
```

**Cascade Delete**:
- Delete Column → CASCADE → Tasks (уже настроено в 003)
- Delete Board → CASCADE → Columns → Tasks

---

## Testing Strategy

**Test Pyramid**:
```
        E2E (minimal)
       /             \
      /   Integration \
     /    (API flows)  \
    /___________________\
   /    Unit (services)  \
  /_______________________\
```

**Test Categories**:
1. **Contract Tests**: API request/response validation
2. **Integration Tests**: Full flows with test database
3. **Unit Tests**: Service logic, validation, permissions

**Test Data**:
- Factory functions для Task, Column, Board
- Fixtures для test user, test board, test column
