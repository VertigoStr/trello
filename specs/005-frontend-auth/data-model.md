# Data Models: Frontend Authentication

**Feature**: 005-frontend-auth
**Date**: 2026-03-25
**Purpose**: TypeScript types и интерфейсы для frontend

---

## Type: User

**Description**: Представление пользователя в frontend приложении.

### Fields

```typescript
interface User {
  id: string;           // UUID
  email: string;        // Уникальный email
  name: string;         // Отображаемое имя
  isActive: boolean;    // Статус аккаунта
  createdAt: string;    // ISO 8601 timestamp
}
```

### Validation Rules

- email: должен соответствовать email regex
- name: 1-100 символов

---

## Type: AuthTokens

**Description**: JWT токены для аутентификации.

### Fields

```typescript
interface AuthTokens {
  accessToken: string;  // JWT токен доступа
  expiresAt?: number;   // Timestamp истечения (опционально)
}
```

### Storage

- Сохраняется в localStorage
- Ключ: `'auth_token'`

---

## Type: AuthState

**Description**: Состояние аутентификации в приложении.

### Fields

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### State Transitions

```typescript
// Initial
{ user: null, isAuthenticated: false, isLoading: false, error: null }

// Loading
{ user: null, isAuthenticated: false, isLoading: true, error: null }

// Authenticated
{ user: User, isAuthenticated: true, isLoading: false, error: null }

// Error
{ user: null, isAuthenticated: false, isLoading: false, error: string }
```

---

## Type: FormErrors

**Description**: Ошибки валидации форм.

### Fields

```typescript
interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  submit?: string;  // Общая ошибка формы
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
  submit?: string;
}

interface ResetPasswordFormErrors {
  password?: string;
  submit?: string;
}
```

---

## Type: API Responses

**Description**: Типы для ответов backend API.

### Fields

```typescript
// Успешный ответ
interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

// Ошибка
interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

// Union type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### Specific Responses

```typescript
type RegisterResponse = ApiResponse<{ user: User; accessToken: string }>;
type LoginResponse = ApiResponse<{ user: User; accessToken: string }>;
type LogoutResponse = ApiResponse<{ message: string }>;
type ForgotPasswordResponse = ApiResponse<{ message: string }>;
type ResetPasswordResponse = ApiResponse<{ message: string }>;
type MeResponse = ApiResponse<{ user: User }>;
```

---

## Validation Functions

### Email Validation

```typescript
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### Password Validation

```typescript
function validatePassword(password: string): boolean {
  return password.length >= 8;
}
```

### Name Validation

```typescript
function validateName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 100;
}
```

---

## Constants

```typescript
// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

// Routes
const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;

// Error codes
const ERROR_CODES = {
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
```

---

## Error Messages

```typescript
const ERROR_MESSAGES = {
  [ERROR_CODES.EMAIL_EXISTS]: 'Email уже используется',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Неверный email или пароль',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Аккаунт заблокирован. Попробуйте позже.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Сессия истекла. Пожалуйста, войдите снова.',
  [ERROR_CODES.NETWORK_ERROR]: 'Ошибка сети. Проверьте соединение.',
} as const;
```
