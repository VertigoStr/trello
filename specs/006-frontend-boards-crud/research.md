# Research: Создание и удаление досок на фронтенде

**Feature**: 006-frontend-boards-crud
**Date**: 2026-03-26
**Purpose**: Technical decisions and best practices for React boards CRUD UI

---

## Decision: React + TypeScript + Bootstrap 5

**Chosen**: React 18+ с TypeScript и Bootstrap 5 (из 005-frontend-auth)

**Rationale**: 
- Уже используется в проекте (005-frontend-auth)
- TypeScript обеспечивает типизацию и снижает ошибки
- Bootstrap 5 предоставляет готовые компоненты (Modal, Form, Card)
- Единый стек для всего frontend

**Alternatives considered**:
- Material UI — больше компонентов, но тяжелее и требует обучения
- Tailwind CSS — больше гибкости, но требует больше кода для модальных окон

---

## Decision: Modal-based CRUD Interface

**Chosen**: Модальные окна для создания/редактирования/удаления досок

**Rationale**:
- Clarification от пользователя (spec.md clarifications)
- Сохраняет контекст главной страницы
- Быстрее чем навигация на отдельные страницы
- Bootstrap Modal готов к использованию

**Implementation Pattern**:
```typescript
// DashboardPage.tsx
const [showCreateModal, setShowCreateModal] = useState(false)

return (
  <>
    <Button onClick={() => setShowCreateModal(true)}>
      Создать доску
    </Button>
    <CreateBoardModal 
      show={showCreateModal}
      onHide={() => setShowCreateModal(false)}
      onCreate={(board) => {
        // Handle created board
        navigate(`/board/${board.id}`)
      }}
    />
  </>
)
```

---

## Decision: Delete Confirmation with Board Name Input

**Chosen**: Модальное окно с вводом названия доски для подтверждения удаления

**Rationale**:
- Clarification от пользователя (spec.md clarifications)
- Максимальная защита от случайного удаления
- Требует осознанного действия от пользователя
- Паттерн используется GitHub, GitLab и другими платформами

**Implementation Pattern**:
```typescript
// DeleteBoardModal.tsx
const [inputValue, setInputValue] = useState('')
const board = useBoardStore()

const isConfirmDisabled = inputValue !== board.title

const handleDelete = async () => {
  if (isConfirmDisabled) return
  await boardService.delete(board.id)
  onHide()
}

return (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Удалить доску?</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>Для подтверждения удаления введите название доски:</p>
      <Form.Control
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={board.title}
      />
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Отмена</Button>
      <Button variant="danger" onClick={handleDelete} disabled={isConfirmDisabled}>
        Удалить
      </Button>
    </Modal.Footer>
  </Modal>
)
```

---

## Decision: State Management with React Hooks

**Chosen**: Custom hook `useBoards` для управления состоянием досок

**Rationale**:
- Простота для данного scope (нет необходимости в Redux/Zustand)
- Следует best practices React
- Легко тестировать и поддерживать
- Соответствует принципу Simplicity (YAGNI)

**Implementation Pattern**:
```typescript
// hooks/useBoards.ts
export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true)
      const data = await boardService.getAll()
      setBoards(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch boards')
    } finally {
      setLoading(false)
    }
  }, [])

  const createBoard = useCallback(async (data: CreateBoardDTO) => {
    const board = await boardService.create(data)
    setBoards(prev => [...prev, board])
    return board
  }, [])

  const deleteBoard = useCallback(async (id: string) => {
    await boardService.delete(id)
    setBoards(prev => prev.filter(b => b.id !== id))
  }, [])

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  return { boards, loading, error, createBoard, deleteBoard, refetch: fetchBoards }
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
// services/boardService.ts
const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export const boardService = {
  async getAll(): Promise<Board[]> {
    const response = await fetch(`${API_BASE}/api/boards`, {
      headers: getAuthHeaders(),
    })
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

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/boards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  },
}
```

---

## Best Practices: React Modal Patterns

### 1. Controlled Modal

```typescript
interface ModalProps {
  show: boolean
  onHide: () => void
  onSubmit?: () => void
}

export function CreateBoardModal({ show, onHide, onSubmit }: ModalProps) {
  const [formData, setFormData] = useState({ title: '', description: '' })
  
  const handleSubmit = () => {
    onSubmit?.()
    onHide()
  }
  
  return (
    <Modal show={show} onHide={onHide} centered>
      {/* Modal content */}
    </Modal>
  )
}
```

### 2. Form Validation

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

const handleSubmit = () => {
  if (!validate()) return
  onSubmit?.()
}
```

### 3. Loading States

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async () => {
  if (!validate()) return
  setIsSubmitting(true)
  try {
    await onSubmit?.()
  } finally {
    setIsSubmitting(false)
  }
}

<Button variant="primary" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner animation="border" size="sm" />
      Создание...
    </>
  ) : (
    'Создать доску'
  )}
</Button>
```

---

## Integration Patterns: Backend API

**Backend Dependency**: 003-task-boards-crud feature

**Endpoints**:
- `GET /api/boards` — список досок
- `POST /api/boards` — создание доски
- `GET /api/boards/{id}` — детальная информация
- `PUT /api/boards/{id}` — редактирование
- `DELETE /api/boards/{id}` — удаление

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
  const board = await boardService.create(data)
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
     /    (CRUD flows) \
    /___________________\
   /  Unit (components)  \
  /_______________________\
```

**Test Categories**:
1. **Unit Tests**: Компоненты (BoardCard, BoardList, Modals)
2. **Integration Tests**: CRUD потоки (создание, редактирование, удаление)
3. **E2E Tests**: Полные сценарии (Playwright)

**Test Coverage Goals**:
- Components: 90%+
- Pages: 80%+
- Services: 100%

---

## Performance Considerations

**Board List Loading**:
- Показывать skeleton loader во время загрузки
- Ленивая загрузка изображений (если будут)
- Кэширование списка досок (React Query или SWR опционально)

**Modal Performance**:
- Рендерить модальные окна только когда они открыты (conditional rendering)
- Очищать форму при закрытии модального окна
- Использовать `centered` prop для Bootstrap Modal

**Optimistic Updates**:
```typescript
// Для улучшения UX можно использовать optimistic updates
const deleteBoard = useCallback(async (id: string) => {
  // Optimistically remove from list
  setBoards(prev => prev.filter(b => b.id !== id))
  
  try {
    await boardService.delete(id)
  } catch (error) {
    // Rollback on error
    setBoards(prev => [...prev, boardToRestore])
    setError('Failed to delete board')
  }
}, [])
```
