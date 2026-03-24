# API Contract: Authentication Endpoints

**Feature**: 002-auth-api  
**Date**: 2026-03-24  
**Purpose**: Contract specification for authentication API endpoints

---

## Base URL

```
/api/auth
```

## Content Type

```
Content-Type: application/json
```

---

## Endpoint 1: Register

**Purpose**: Регистрация нового пользователя.

### Request

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "name": "John Doe"
}
```

### Request Schema

```json
{
  "type": "object",
  "required": ["email", "password", "password_confirm", "name"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 255,
      "description": "Уникальный email адрес"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "maxLength": 128,
      "pattern": "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$",
      "description": "Пароль (минимум 8 символов, буквы и цифры)"
    },
    "password_confirm": {
      "type": "string",
      "description": "Подтверждение пароля (должно совпадать с password)"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Имя пользователя"
    }
  }
}
```

### Response: 201 Created

```json
{
  "status": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800
  }
}
```

### Response: 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password confirmation does not match",
    "details": [
      {
        "field": "password_confirm",
        "message": "Passwords do not match"
      }
    ]
  }
}
```

### Response: 409 Conflict

```json
{
  "status": "error",
  "error": {
    "code": "USER_EXISTS",
    "message": "User with this email already exists"
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
  "password": "SecurePass123"
}
```

### Request Schema

```json
{
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 255
    },
    "password": {
      "type": "string",
      "maxLength": 128
    }
  }
}
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800
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
    "message": "Account is locked due to too many failed login attempts",
    "details": {
      "locked_until": "2026-03-24T15:30:00Z"
    }
  }
}
```

---

## Endpoint 3: Logout

**Purpose**: Выход пользователя из системы (аннулирование токена).

### Request

```http
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer токен доступа |

### Response: 200 OK

```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

### Response: 401 Unauthorized

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
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
| USER_EXISTS | 409 | Пользователь с таким email уже существует |
| INVALID_CREDENTIALS | 401 | Неверный email или пароль |
| ACCOUNT_LOCKED | 423 | Аккаунт заблокирован после多次 неудачных попыток |
| INVALID_TOKEN | 401 | Токен недействителен или истёк |
| INTERNAL_ERROR | 500 | Внутренняя ошибка сервера |

---

## Rate Limiting

### Headers

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Максимальное количество запросов |
| X-RateLimit-Remaining | Оставшееся количество запросов |
| X-RateLimit-Reset | Время сброса счётчика (Unix timestamp) |

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 requests | 15 minutes (per email) |
| POST /api/auth/register | 10 requests | 1 hour (per IP) |
| POST /api/auth/logout | 30 requests | 1 minute (per token) |

---

## Security Requirements

1. **HTTPS Only**: Все запросы должны быть по HTTPS (в продакшене)
2. **CORS**: Настроить CORS для разрешённых доменов
3. **Input Validation**: Валидировать все входные данные
4. **Output Encoding**: Кодировать вывод для предотвращения XSS
5. **Logging**: Логировать все попытки входа (успешные и неудачные)
6. **No Sensitive Data in Logs**: Не логировать пароли и токены
