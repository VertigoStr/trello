# Quickstart: Frontend Boards CRUD

**Feature**: 006-frontend-boards-crud
**Date**: 2026-03-26
**Purpose**: Integration guide and usage examples

---

## Prerequisites

- Node.js 18+ installed
- Backend API running (003-task-boards-crud feature)
- Frontend authentication working (005-frontend-auth)
- User logged in with valid JWT token

---

## Step 1: View Board List

### Via UI

1. Navigate to dashboard (home page) after login
2. See list of all your boards
3. Click on any board to view details

### Via Code

```typescript
import { boardService } from '@/services/boardService'

// Fetch all boards
const boards = await boardService.getAll()
console.log('My boards:', boards)
```

---

## Step 2: Create New Board

### Via UI

1. Click "Создать доску" button on dashboard
2. Fill in the modal form:
   - Title: "My New Board" (required, 1-255 chars)
   - Description: "Board description" (optional, 0-10000 chars)
3. Click "Создать"
4. Redirected to the new board detail page

### Via Code

```typescript
import { boardService } from '@/services/boardService'

try {
  const board = await boardService.create({
    title: 'My New Board',
    description: 'Board description',
  })
  
  console.log('Created board:', board.id)
  // Navigate to board
  navigate(`/board/${board.id}`)
} catch (error) {
  if (error.error?.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  }
}
```

---

## Step 3: View Board Details

### Via UI

1. Click on any board from the list
2. See board details with columns and tasks
3. See member count and task count

### Via Code

```typescript
import { boardService } from '@/services/boardService'

try {
  const board = await boardService.getById('board-uuid')
  console.log('Board details:', board)
} catch (error) {
  if (error.error?.code === 'ACCESS_DENIED') {
    // Handle access denied
  } else if (error.error?.code === 'BOARD_NOT_FOUND') {
    // Handle not found
  }
}
```

---

## Step 4: Edit Board

### Via UI

1. Open board settings/menu (only for owner)
2. Click "Редактировать"
3. Update title or description
4. Click "Сохранить"
5. Changes are saved

### Via Code

```typescript
import { boardService } from '@/services/boardService'

try {
  const updatedBoard = await boardService.update('board-uuid', {
    title: 'Updated Title',
    description: 'Updated description',
  })
  
  console.log('Updated board:', updatedBoard)
} catch (error) {
  if (error.error?.code === 'OWNER_ONLY') {
    // Handle owner-only restriction
  }
}
```

---

## Step 5: Delete Board

### Via UI

1. Open board settings/menu (only for owner)
2. Click "Удалить доску"
3. Confirmation modal appears
4. Enter board title to confirm
5. Click "Удалить"
6. Board is deleted and redirected to dashboard

### Via Code

```typescript
import { boardService } from '@/services/boardService'

try {
  await boardService.delete('board-uuid')
  console.log('Board deleted successfully')
  // Navigate back to dashboard
  navigate('/')
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
// CreateBoardModal.tsx
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
    await boardService.create(formData)
  } catch (error) {
    if (error.error?.code === 'VALIDATION_ERROR') {
      // Handle API validation errors
    }
  }
}
```

### Access Denied

```typescript
// BoardDetailPage.tsx
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchBoard = async () => {
    try {
      const board = await boardService.getById(boardId)
      setBoard(board)
    } catch (err) {
      if ((err as ApiError).error?.code === 'ACCESS_DENIED') {
        setError('У вас нет доступа к этой доске')
      } else if ((err as ApiError).error?.code === 'BOARD_NOT_FOUND') {
        setError('Доска не найдена')
      }
    }
  }
  
  fetchBoard()
}, [boardId])
```

---

## Testing Examples

### Component Test

```typescript
// tests/components/boards/BoardCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardCard } from '@/components/boards/BoardCard'

describe('BoardCard', () => {
  it('renders board title and description', () => {
    const board = {
      id: 'board-123',
      title: 'Test Board',
      description: 'Test description',
      owner_id: 'user-123',
      status: 'active',
      created_at: '2026-03-26T10:00:00Z',
      updated_at: '2026-03-26T10:00:00Z',
    }
    
    render(<BoardCard board={board} onClick={vi.fn()} />)
    
    expect(screen.getByText('Test Board')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    const board = { /* ... */ }
    
    render(<BoardCard board={board} onClick={handleClick} />)
    
    fireEvent.click(screen.getByText('Test Board'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Integration Test

```typescript
// tests/integration/CreateBoardFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardPage } from '@/pages/DashboardPage'

describe('CreateBoardFlow', () => {
  it('creates a new board successfully', async () => {
    // Mock boardService.create
    vi.spyOn(boardService, 'create').mockResolvedValueOnce({
      id: 'board-123',
      title: 'New Board',
      description: 'Description',
      owner_id: 'user-123',
      status: 'active',
      created_at: '2026-03-26T10:00:00Z',
      updated_at: '2026-03-26T10:00:00Z',
    })
    
    render(<DashboardPage />)
    
    // Click create button
    fireEvent.click(screen.getByText('Создать доску'))
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/название/i), {
      target: { value: 'New Board' }
    })
    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: 'Description' }
    })
    
    // Submit
    fireEvent.click(screen.getByText('Создать'))
    
    // Wait for success
    await waitFor(() => {
      expect(boardService.create).toHaveBeenCalledWith({
        title: 'New Board',
        description: 'Description',
      })
    })
  })
})
```

---

## Best Practices

### 1. Always Check Permissions

```typescript
// Only show delete button for owner
{board.owner_id === currentUser.id && (
  <Button variant="danger" onClick={handleDelete}>
    Удалить доску
  </Button>
)}
```

### 2. Show Loading States

```typescript
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchBoards = async () => {
    setLoading(true)
    try {
      const boards = await boardService.getAll()
      setBoards(boards)
    } catch (error) {
      setError('Failed to load boards')
    } finally {
      setLoading(false)
    }
  }
  
  fetchBoards()
}, [])

if (loading) {
  return <Spinner animation="border" />
}
```

### 3. Clear Form on Modal Close

```typescript
const handleModalClose = () => {
  setShowModal(false)
  setFormData({ title: '', description: '' })
  setErrors({})
}
```

### 4. Confirm Delete with Board Name

```typescript
const isDeleteDisabled = inputValue !== board.title

<Button 
  variant="danger" 
  onClick={handleDelete} 
  disabled={isDeleteDisabled}
>
  Удалить
</Button>
```
