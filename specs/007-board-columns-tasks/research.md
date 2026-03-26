# Research: Доска с колонками и задачами

**Feature**: 007-board-columns-tasks
**Date**: 2026-03-26
**Purpose**: Technical decisions and best practices for board columns and tasks UI

---

## Decision: React + TypeScript + Bootstrap 5

**Chosen**: React 18+ с TypeScript и Bootstrap 5 (из 005-frontend-auth)

**Rationale**: 
- Уже используется в проекте (005-frontend-auth)
- TypeScript обеспечивает типизацию и снижает ошибки
- Bootstrap 5 предоставляет готовые компоненты (Modal, Card, Form)
- Единый стек для всего frontend

**Alternatives considered**:
- Material UI — больше компонентов, но тяжелее и требует обучения
- Tailwind CSS — больше гибкости, но требует больше кода для модальных окон

---

## Decision: Drag-and-Drop Library (@dnd-kit)

**Chosen**: @dnd-kit/core + @dnd-kit/sortable для перемещения задач

**Rationale**:
- Современная библиотека с хорошей поддержкой
- Легковесная по сравнению с react-beautiful-dnd
- Поддержка touch устройств
- Хорошая документация и примеры
- Совместимость с TypeScript

**Implementation Pattern**:
```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function BoardDetail({ columns, tasks, onMoveTask }) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onMoveTask(active.id, over.id)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {columns.map(column => (
        <SortableContext
          key={column.id}
          items={tasks[column.id]}
          strategy={verticalListSortingStrategy}
        >
          <ColumnCard column={column} tasks={tasks[column.id]} />
        </SortableContext>
      ))}
    </DndContext>
  )
}
```

**Alternatives considered**:
- react-beautiful-dnd — устаревшая, не поддерживается активно
- react-dnd — более низкого уровня, требует больше кода
- Реализация своего drag-and-drop — слишком сложно для MVP

---

## Decision: Modal-based CRUD Interface

**Chosen**: Модальные окна для создания/редактирования/удаления колонок и задач

**Rationale**:
- Сохраняет контекст доски (не нужно переходить на другие страницы)
- Быстрее чем навигация на отдельные страницы
- Bootstrap Modal готов к использованию
- Согласованность с 006-frontend-boards-crud

**Implementation Pattern**:
```typescript
// BoardDetailPage.tsx
const [showCreateColumn, setShowCreateColumn] = useState(false)
const [showCreateTask, setShowCreateTask] = useState(false)

return (
  <>
    <Button onClick={() => setShowCreateColumn(true)}>
      Добавить колонку
    </Button>
    <CreateColumnModal
      show={showCreateColumn}
      onHide={() => setShowCreateColumn(false)}
      onCreate={handleCreateColumn}
    />
  </>
)
```

---

## Decision: State Management with Custom Hook

**Chosen**: Custom hook `useBoard` для управления состоянием доски

**Rationale**:
- Простота для данного scope (нет необходимости в Redux/Zustand)
- Следует best practices React
- Легко тестировать и поддерживать
- Соответствует принципу Simplicity (YAGNI)

**Implementation Pattern**:
```typescript
// hooks/useBoard.ts
export function useBoard(boardId: string): UseBoardReturn {
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true)
      const [boardData, columnsData, tasksData] = await Promise.all([
        boardService.getById(boardId),
        columnService.getByBoard(boardId),
        taskService.getByBoard(boardId),
      ])
      setBoard(boardData)
      setColumns(columnsData)
      setTasks(tasksData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board')
    } finally {
      setLoading(false)
    }
  }, [boardId])

  const moveTask = useCallback(async (taskId: string, newColumnId: string, newPosition: number) => {
    await taskService.move(taskId, { columnId: newColumnId, position: newPosition })
    // Update local state
    setTasks(prev => {
      // Move task logic
    })
  }, [])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  return {
    board,
    columns,
    tasks,
    loading,
    error,
    moveTask,
    refetch: fetchBoard,
  }
}
```

---

## Decision: API Integration Pattern

**Chosen**: Service layer с typed fetch

**Rationale**:
- Разделение ответственности (UI vs API)
- Типизация запросов/ответов
- Легко моковать для тестов
- Соответствует Library-First principle

**Implementation Pattern**:
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

export const columnService = {
  async create(boardId: string, data: CreateColumnDTO): Promise<Column> {
    const response = await fetch(`${API_BASE}/api/boards/${boardId}/columns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Column>(response)
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

---

## Best Practices: Drag-and-Drop Implementation

### 1. Task Card Component

```typescript
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card>
        <Card.Body>{task.title}</Card.Body>
      </Card>
    </div>
  )
}
```

### 2. Column Component with Sortable Tasks

```typescript
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function ColumnCard({ column, tasks }) {
  return (
    <div className="column">
      <h3>{column.title}</h3>
      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  )
}
```

### 3. Board with DndContext

```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core'

function BoardDetail({ boardId }) {
  const { columns, tasks, moveTask } = useBoard(boardId)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const taskId = active.id
      const newColumnId = over.id // or over.data.current?.columnId
      moveTask(taskId, newColumnId)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {columns.map(column => (
        <ColumnCard
          key={column.id}
          column={column}
          tasks={tasks[column.id] || []}
        />
      ))}
    </DndContext>
  )
}
```

---

## Integration Patterns: Backend API

**Backend Dependency**: 003-task-boards-crud feature

**Expected Endpoints**:
- `POST /api/boards/{board_id}/columns` — создание колонки
- `PUT /api/columns/{column_id}` — редактирование колонки
- `DELETE /api/columns/{column_id}` — удаление колонки
- `PUT /api/columns/{column_id}/move` — перемещение колонки
- `POST /api/columns/{column_id}/tasks` — создание задачи
- `PUT /api/tasks/{task_id}` — редактирование задачи
- `DELETE /api/tasks/{task_id}` — удаление задачи
- `PUT /api/tasks/{task_id}/move` — перемещение задачи

**Error Handling**:
```typescript
interface ApiError {
  status: 'error'
  error: {
    code: string
    message: string
    details?: any[]
  }
}

// Обработка ошибок
try {
  const column = await columnService.create(boardId, data)
} catch (error) {
  if ((error as ApiError).error?.code === 'ACCESS_DENIED') {
    // Handle access denied
  } else if ((error as ApiError).error?.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  } else {
    // Generic error
  }
}
```

---

## Testing Strategy

**Test Pyramid**:
```
        E2E (minimal)
       /             \
      /   Integration \
     /    (CRUD flows, drag-and-drop) \
    /___________________\
   /  Unit (components)  \
  /_______________________\
```

**Test Categories**:
1. **Unit Tests**: Компоненты (ColumnCard, TaskCard, Modals)
2. **Integration Tests**: CRUD потоки, drag-and-drop
3. **E2E Tests**: Полные сценарии (Playwright)

**Test Coverage Goals**:
- Components: 90%+
- Pages: 80%+
- Services: 100%

---

## Performance Considerations

### Board Loading

- Показывать skeleton loader во время загрузки
- Загружать колонки и задачи параллельно через Promise.all
- Ленивая загрузка для больших досок (опционально)

### Drag-and-Drop Performance

- Использовать CSS transforms для анимации (hardware accelerated)
- Избегать перерисовки всего списка при перемещении
- Оптимистичное обновление UI до ответа сервера

### Optimistic Updates

```typescript
const moveTask = useCallback(async (taskId: string, newColumnId: string) => {
  // Optimistically update UI
  setTasks(prev => {
    // Find and remove task from old column
    // Add task to new column
  })
  
  try {
    await taskService.move(taskId, { columnId: newColumnId })
  } catch (error) {
    // Rollback on error
    setTasks(prev => {
      // Restore previous state
    })
    setError('Failed to move task')
  }
}, [])
```
