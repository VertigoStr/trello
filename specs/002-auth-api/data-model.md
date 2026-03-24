# Data Model: Authentication & Registration API

**Feature**: 002-auth-api  
**Date**: 2026-03-24  
**Purpose**: Models and entities for authentication system

---

## Entity 1: User

**Description**: Представляет пользователя системы с учётными данными.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Уникальный идентификатор пользователя |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email адрес для входа |
| password_hash | VARCHAR(255) | NOT NULL | Хэш пароля (bcrypt) |
| name | VARCHAR(100) | NOT NULL | Имя пользователя |
| is_active | BOOLEAN | DEFAULT TRUE | Статус аккаунта (активен/заблокирован) |
| failed_login_attempts | INTEGER | DEFAULT 0 | Счётчик неудачных попыток входа |
| locked_until | TIMESTAMP | NULL | Время разблокировки после блокировки |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата создания аккаунта |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата последнего обновления |

### Indexes

- `idx_users_email` — уникальный индекс по email для быстрого поиска
- `idx_users_is_active` — индекс для фильтрации активных пользователей

### Constraints

- Email должен быть валидным форматом (проверка на уровне приложения)
- Пароль должен соответствовать требованиям сложности (минимум 8 символов, буквы и цифры)
- failed_login_attempts сбрасывается в 0 после успешного входа
- Аккаунт блокируется при failed_login_attempts >= 5

---

## Entity 2: AccessToken (Token Revocation List)

**Description**: Таблица для хранения аннулированных токенов (blacklist).

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Уникальный идентификатор записи |
| token_jti | UUID | UNIQUE, NOT NULL | JWT ID токена (уникальный идентификатор) |
| user_id | UUID | FOREIGN KEY → User.id | Владелец токена |
| revoked_at | TIMESTAMP | DEFAULT NOW() | Время аннулирования |
| expires_at | TIMESTAMP | NOT NULL | Время истечения токена |

### Indexes

- `idx_token_jti` — уникальный индекс для быстрой проверки blacklist
- `idx_token_user_id` — индекс для поиска токенов пользователя
- `idx_token_expires_at` — индекс для очистки истёкших токенов

### Constraints

- Токен считается действительным, если его нет в этой таблице и не истёк срок
- Записи удаляются после истечения срока действия токена

---

## Relationships

```text
User (1) ──< AccessToken (N)
  │
  └── One user can have multiple active tokens
  └── When user logs out, token is added to blacklist
  └── When user is deleted, all tokens are revoked
```

---

## State Transitions

### User Account States

```text
[Created] ──successful login──> [Active]
    │                              │
    │                              │──5 failed attempts──> [Locked]
    │                              │                           │
    │                              │<──locked_until passed─────┘
    │
    └──email confirmation (optional future)──> [Verified]
```

### Token States

```text
[Issued] ──user logout──> [Revoked (blacklisted)]
    │
    │──expiration time passed──> [Expired]
```

---

## Validation Rules

### Registration (Create User)

1. Email должен быть уникальным (проверка через БД)
2. Пароль должен соответствовать требованиям:
   - Минимум 8 символов
   - Хотя бы одна буква
   - Хотя бы одна цифра
3. Имя не должно быть пустым (1-100 символов)

### Login (Authenticate User)

1. Проверка exists email
2. Проверка password_hash
3. Проверка is_active (не заблокирован)
4. Проверка failed_login_attempts < 5
5. Проверка locked_until (если заблокирован)

### Logout (Revoke Token)

1. Проверка валидности токена (не истёк, не в blacklist)
2. Добавление token_jti в blacklist

---

## Security Considerations

1. **Password Storage**:
   - bcrypt с cost factor 12
   - Соль генерируется автоматически для каждого пароля

2. **Token Security**:
   - JWT с алгоритмом HS256
   - Срок действия: 7 дней (168 часов)
   - Уникальный JTI для каждого токена

3. **Rate Limiting**:
   - 5 попыток входа на один email
   - Блокировка на 15 минут после превышения
   - Сброс счётчика после успешного входа

4. **SQL Injection Prevention**:
   - Использование ORM (SQLAlchemy) с параметризованными запросами
   - Валидация всех входных данных

---

## Future Extensions (Not in Scope)

- Refresh tokens (для продления сессии без повторного входа)
- Password reset tokens (для восстановления пароля)
- Email verification tokens (для подтверждения email)
- OAuth2 integration (Google, GitHub login)
- Two-factor authentication (2FA)
