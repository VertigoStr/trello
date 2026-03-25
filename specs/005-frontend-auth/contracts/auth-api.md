# API Contracts: Authentication Backend Integration

**Feature**: 005-frontend-auth
**Date**: 2026-03-25
**Purpose**: Контракты для интеграции с 002-auth-api backend

---

## Base Configuration

**Base URL**: `http://localhost:8000` (development)
**Content-Type**: `application/json`
**Authentication**: Bearer token в заголовке `Authorization`

---

## Endpoint 1: Register

**Purpose**: Регистрация нового пользователя.

### Request

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

### Request Schema

```typescript
interface RegisterRequest {
  email: string;      // Valid email format
  password: string;   // Min 8 characters
  name: string;       // 1-100 characters
}
```

### Response: 201 Created

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "isActive": true,
      "createdAt": "2026-03-25T10:00:00Z"
    },
    "accessToken": "jwt-token-string"
  }
}
```

### Response: 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists",
    "details": [...]
  }
}
```

---

## Endpoint 2: Login

**Purpose**: Аутентификация пользователя.

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Request Schema

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "isActive": true
    },
    "accessToken": "jwt-token-string"
  }
}
```

### Response: 401 Unauthorized

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### Response: 423 Locked

```json
{
  "status": "error",
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to too many failed attempts"
  }
}
```

---

## Endpoint 3: Logout

**Purpose**: Выход из системы.

### Request

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Endpoint 4: Forgot Password

**Purpose**: Запрос сброса пароля.

### Request

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Request Schema

```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "message": "Password reset instructions sent to your email"
  }
}
```

**Note**: Всегда возвращаем 200 даже если email не найден (security best practice).

---

## Endpoint 5: Reset Password

**Purpose**: Установка нового пароля по токену.

### Request

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newsecurepassword123"
}
```

### Request Schema

```typescript
interface ResetPasswordRequest {
  token: string;    // Token from email link
  password: string; // New password (min 8 chars)
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "message": "Password reset successfully"
  }
}
```

### Response: 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_OR_EXPIRED_TOKEN",
    "message": "Reset token is invalid or expired"
  }
}
```

---

## Endpoint 6: Get Current User

**Purpose**: Получение данных текущего пользователя.

### Request

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "isActive": true,
      "createdAt": "2026-03-25T10:00:00Z"
    }
  }
}
```

### Response: 401 Unauthorized

```json
{
  "status": "error",
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token has expired"
  }
}
```

---

## Error Handling

### Standard Error Schema

```typescript
interface ApiError {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Ошибка валидации входных данных |
| EMAIL_EXISTS | 400 | Email уже зарегистрирован |
| INVALID_CREDENTIALS | 401 | Неверный email или пароль |
| TOKEN_EXPIRED | 401 | JWT токен истёк |
| ACCOUNT_LOCKED | 423 | Аккаунт заблокирован |
| INVALID_OR_EXPIRED_TOKEN | 400 | Токен сброса невалиден |
| NETWORK_ERROR | N/A | Ошибка сети (client-side) |

---

## Frontend Integration Example

```typescript
// services/authService.ts

const API_BASE = 'http://localhost:8000/api/auth';

export async function register(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  
  const data = await response.json();
  
  if (data.status === 'error') {
    throw new Error(data.error.message);
  }
  
  return data.data;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.status === 'error') {
    throw new Error(data.error.message);
  }
  
  // Save token to localStorage
  localStorage.setItem('auth_token', data.data.accessToken);
  
  return data.data;
}

export async function logout() {
  const token = localStorage.getItem('auth_token');
  
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  localStorage.removeItem('auth_token');
}
```
