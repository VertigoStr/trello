# Quickstart: Board Columns and Tasks

**Feature**: 007-board-columns-tasks
**Date**: 2026-03-26
**Purpose**: Integration guide and usage examples

---

## Prerequisites

- Node.js 18+ installed
- Backend API running (003-task-boards-crud feature)
- Frontend authentication working (005-frontend-auth)
- Board created (006-frontend-boards-crud)
- User logged in with valid JWT token

---

## Step 1: View Board Detail

### Via UI

1. Navigate to dashboard (home page) after login
2. Click on any board from the list
3. See board detail page with columns and tasks

### Via Code

```typescript
import { useBoard } from '@/hooks/useBoard'

function BoardDetailPage({ boardId }) {
  const { board, columns, tasks, loading, error } = useBoard(boardId)

  if (loading) return <Spinner />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div>
      <h1>{board.title}</h1>
      {columns.map(column => (
        <ColumnCard
          key={column.id}
          column={column}
          tasks={tasks[column.id] || []}
        />
      ))}
    </div>
  )
}
```

---

## Step 2: Create Column

### Via UI

1. Open board detail page
2. Click "Добавить колонку" button
3. Fill in the modal form:
   - Title: "To Do" (required, 1-255 chars)
4. Click "Создать"
5. Column appears on the board

### Via Code

```typescript
import { columnService } from '@/services/columnService'

try {
  const column = await columnService.create(boardId, {
    title: 'To Do',
  })
  
  console.log('Created column:', column.id)
} catch (error) {
  if (error.error?.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  }
}
```

---

## Step 3: Create Task

### Via UI

1. Open board detail page
2. Click "Добавить задачу" in a column
3. Fill in the modal form:
   - Title: "New Task" (required, 1-255 chars)
   - Description: "Task description" (optional)
4. Click "Создать"
5. Task appears in the column

### Via Code

```typescript
import { taskService } from '@/services/taskService'

try {
  const task = await taskService.create(columnId, {
    title: 'New Task',
    description: 'Task description',
  })
  
  console.log('Created task:', task.id)
} catch (error) {
  if (error.error?.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  }
}
```

---

## Step 4: Move Task (Drag-and-Drop)

### Via UI

1. Open board detail page
2. Click and hold on a task card
3. Drag to another column
4. Release to drop
5. Task moves to the new column

### Via Code

```typescript
import { taskService } from '@/services/taskService'

// Using @dnd-kit
import { DndContext, DragEndEvent } from '@dnd-kit/core'

function BoardDetail({ boardId }) {
  const { columns, tasks, moveTask } = useBoard(boardId)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const taskId = active.id
      const newColumnId = over.id // or over.data.current?.columnId
      
      try {
        await taskService.move(taskId, {
          columnId: newColumnId,
          position: 0, // or calculate from drop position
        })
      } catch (error) {
        // Handle error (rollback UI)
      }
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

## Step 5: Edit Task

### Via UI

1. Click on a task card
2. Click "Редактировать" button
3. Update title or description
4. Click "Сохранить"
5. Changes are saved

### Via Code

```typescript
import { taskService } from '@/services/taskService'

try {
  const updatedTask = await taskService.update(taskId, {
    title: 'Updated Title',
    description: 'Updated description',
  })
  
  console.log('Updated task:', updatedTask)
} catch (error) {
  if (error.error?.code === 'ACCESS_DENIED') {
    // Handle access denied
  }
}
```

---

## Step 6: Delete Task

### Via UI

1. Click on a task card
2. Click "Удалить" button
3. Confirm deletion
4. Task is removed from the column

### Via Code

```typescript
import { taskService } from '@/services/taskService'

try {
  await taskService.delete(taskId)
  console.log('Task deleted successfully')
} catch (error) {
  if (error.error?.code === 'ACCESS_DENIED') {
    // Handle access denied
  }
}
```

---

## Step 7: Delete Column

### Via UI

1. Open board detail page
2. Click "⋮" menu on a column
3. Click "Удалить колонку"
4. Confirm deletion (warning about tasks)
5. Column and all tasks are removed

### Via Code

```typescript
import { columnService } from '@/services/columnService'

try {
  await columnService.delete(columnId)
  console.log('Column deleted successfully')
} catch (error) {
  if (error.error?.code === 'OWNER_ONLY') {
    // Handle owner-only restriction
  }
}
```

---

## Error Handling Examples

### Validation Errors

```typescript
const [errors, setErrors] = useState<Record<string, string>>({})

const validate = () => {
  const newErrors: Record<string, string> = {}
  if (!formData.title.trim()) {
    newErrors.title = 'Название обязательно'
  }
  if (formData.title.length > 255) {
    newErrors.title = 'Название не более 255 символов'
  }
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  
  try {
    await columnService.create(boardId, formData)
  } catch (error) {
    if (error.error?.code === 'VALIDATION_ERROR') {
      // Handle API validation errors
    }
  }
}
```

### Access Denied

```typescript
const handleMoveTask = async (taskId: string, newColumnId: string) => {
  try {
    await taskService.move(taskId, { columnId: newColumnId })
  } catch (error) {
    if ((error as ApiError).error?.code === 'ACCESS_DENIED') {
      setError('У вас нет доступа для перемещения задач')
    }
  }
}
```

---

## Testing Examples

### Component Test

```typescript
// tests/components/board/ColumnCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ColumnCard } from '@/components/board/ColumnCard'

describe('ColumnCard', () => {
  it('renders column title and tasks', () => {
    const column = {
      id: 'column-123',
      title: 'To Do',
      position: 0,
    }
    const tasks = [
      { id: 'task-1', title: 'Task 1' },
      { id: 'task-2', title: 'Task 2' },
    ]
    
    render(<ColumnCard column={column} tasks={tasks} />)
    
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })
  
  it('calls onAddTask when add button clicked', () => {
    const handleAddTask = vi.fn()
    const column = { id: 'column-123', title: 'To Do', position: 0 }
    
    render(
      <ColumnCard
        column={column}
        tasks={[]}
        onAddTask={handleAddTask}
      />
    )
    
    fireEvent.click(screen.getByText('Добавить задачу'))
    expect(handleAddTask).toHaveBeenCalled()
  })
})
```

### Integration Test

```typescript
// tests/integration/CreateTaskFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardDetailPage } from '@/pages/BoardDetailPage'

describe('CreateTaskFlow', () => {
  it('creates a new task successfully', async () => {
    // Mock taskService.create
    vi.spyOn(taskService, 'create').mockResolvedValueOnce({
      id: 'task-123',
      title: 'New Task',
      description: 'Description',
      column_id: 'column-123',
      position: 0,
    })
    
    render(<BoardDetailPage boardId="board-123" />)
    
    // Click add task button
    fireEvent.click(screen.getByText('Добавить задачу'))
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/название/i), {
      target: { value: 'New Task' }
    })
    
    // Submit
    fireEvent.click(screen.getByText('Создать'))
    
    // Wait for success
    await waitFor(() => {
      expect(taskService.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Description',
      })
    })
  })
})
```

---

## Best Practices

### 1. Optimistic Updates for Drag-and-Drop

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event
  
  if (over && active.id !== over.id) {
    const taskId = active.id
    const newColumnId = over.id
    
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
  }
}
```

### 2. Loading States

```typescript
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchBoard = async () => {
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
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  fetchBoard()
}, [boardId])
```

### 3. Clear Form on Modal Close

```typescript
const handleModalClose = () => {
  setFormData({ title: '', description: '' })
  setErrors({})
  setShowModal(false)
}
```

### 4. Confirm Before Delete Column

```typescript
const handleDeleteColumn = async () => {
  const taskCount = tasks[column.id]?.length || 0
  
  if (taskCount > 0) {
    const confirmed = window.confirm(
      `Эта колонка содержит ${taskCount} задач(и). Все задачи будут удалены. Продолжить?`
    )
    if (!confirmed) return
  }
  
  try {
    await columnService.delete(columnId)
  } catch (error) {
    setError(error.message)
  }
}
```
