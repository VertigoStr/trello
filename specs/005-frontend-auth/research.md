# Research: Фронтенд регистрации и авторизации

**Feature**: 005-frontend-auth
**Date**: 2026-03-25
**Purpose**: Technical decisions and best practices for React authentication frontend

---

## Decision: React + TypeScript + Vite

**Chosen**: React 18+ с TypeScript и Vite для сборки

**Rationale**: 
- Clarification от пользователя (spec.md clarifications)
- TypeScript обеспечивает типизацию и снижает ошибки
- Vite обеспечивает быструю разработку и сборку
- React имеет наибольшую экосистему и сообщество

**Alternatives considered**:
- Vue 3 + TypeScript — проще в изучении, но меньше enterprise adoption
- Ванильный JS — больше boilerplate, сложнее поддерживать

---

## Decision: Component Architecture

**Chosen**: Библиотечная архитектура с переиспользуемыми компонентами

**Rationale**:
- Соответствует конституции (Library-First principle)
- Упрощает тестирование отдельных компонентов
- Позволяет переиспользование между страницами

**Structure**:
```
components/
├── common/         # Button, Input, FormError — переиспользуемые
└── layout/         # Header, ProtectedRoute — layout компоненты

pages/
├── LoginPage       # Страница входа
├── RegisterPage    # Страница регистрации
└── ...

services/
└── authService.ts  # API интеграция

hooks/
├── useAuth.ts      # Хук состояния аутентификации
└── useNavigate.ts  # Хук навигации
```

---

## Decision: Routing Strategy

**Chosen**: React Router 6+ с protected routes

**Rationale**:
- Стандарт де-факто для React приложений
- Поддержка nested routes и layout routes
- Protected routes для защиты от неаутентифицированных пользователей

**Implementation**:
```typescript
// ProtectedRoute компонент
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Внутри ProtectedRoute:
if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}
```

---

## Decision: Token Storage (localStorage)

**Chosen**: localStorage для JWT токена (из clarifications)

**Rationale**:
- Clarification от пользователя: "токен сохраняется между сессиями"
- Удобство — пользователь остаётся залогиненным
- Принятый риск XSS (mitigate через input sanitization)

**Security Considerations**:
- Input sanitization для всех пользовательских данных
- HTTPS для всех API запросов
- Token expiration проверка при каждом запросе

**Alternatives considered**:
- sessionStorage — безопаснее, но требует повторного входа
- httpOnly cookie — максимально безопасно, требует backend изменений

---

## Decision: Form Validation

**Chosen**: Клиентская валидация с дублированием на backend

**Rationale**:
- Мгновенная обратная связь пользователю
- Снижение нагрузки на backend
- Backend валидация как последний рубеж

**Validation Rules**:
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: минимум 8 символов
- Name: 1-100 символов, не пустое

---

## Decision: State Management

**Chosen**: React Context + localStorage для auth state

**Rationale**:
- Простота для данного scope (6 страниц)
- Избегание избыточной сложности (YAGNI)
- Redux/Zustand не нужны для такой規模

**Implementation**:
```typescript
// AuthContext
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}
```

---

## Best Practices: React Authentication

### 1. Protected Routes

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}
```

### 2. Token Refresh Pattern

```typescript
async function fetchWithAuth(url: string, options: RequestInit) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired — logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return response;
}
```

### 3. Form Handling

```typescript
function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  
  const validate = () => {
    const newErrors: any = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Некорректный email';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrors({ submit: 'Неверный email или пароль' });
    }
  };
}
```

---

## Integration Patterns: Backend API

**Backend Dependency**: 002-auth-api feature

**Endpoints**:
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/logout` — выход
- `POST /api/auth/forgot-password` — запрос сброса
- `POST /api/auth/reset-password` — установка нового пароля
- `GET /api/auth/me` — получение текущего пользователя

**Error Handling**:
```typescript
interface ApiError {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

// Обработка ошибок
try {
  const response = await authService.login(email, password);
  if (response.status === 'error') {
    setErrors({ submit: response.error.message });
  }
} catch (networkError) {
  setErrors({ submit: 'Ошибка сети. Проверьте соединение.' });
}
```

---

## Testing Strategy

**Test Pyramid**:
```
        E2E (minimal)
       /             \
      /   Integration \
     /    (forms)      \
    /___________________\
   /  Unit (components)  \
  /_______________________\
```

**Test Categories**:
1. **Unit Tests**: Компоненты (Button, Input, FormError)
2. **Integration Tests**: Формы (регистрация, вход)
3. **E2E Tests**: Полные сценарии (Cypress/Playwright)

**Test Coverage Goals**:
- Components: 90%+
- Pages: 80%+
- Services: 100%

---

## Performance Considerations

**Bundle Size**:
- Code splitting для страниц
- Lazy loading для route components
- Tree shaking для unused code

**Loading States**:
- Skeleton screens для страниц
- Loading spinner для форм
- Optimistic updates где возможно

**Caching**:
- React Query или SWR для data fetching (опционально)
- localStorage для auth state
