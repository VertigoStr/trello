# Implementation Plan: Authentication & Registration API

**Branch**: `002-auth-api` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for authentication and registration API

## Summary

**Primary requirement**: Реализовать API для регистрации, авторизации и управления сессиями пользователей.

**Technical approach**: JWT-аутентификация с хэшированием паролей (bcrypt), rate limiting для защиты от brute-force, stateless архитектура для масштабируемости.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, PyJWT, bcrypt, SQLAlchemy (async)
**Storage**: PostgreSQL 15+
**Testing**: pytest + pytest-asyncio
**Target Platform**: macOS, Linux, Windows (WSL)
**Project Type**: Backend API (веб-приложение)
**Performance Goals**: 99.9% запросов за ≤500ms, регистрация и вход за ≤1 минуты
**Constraints**: 2GB RAM мин., 1 ядро CPU мин.
**Scale/Scope**: Stateless JWT аутентификация, in-memory rate limiting

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Test-First (NON-NEGOTIABLE)
- **Status**: ✅ Pass (Phase 1)
- **Implementation**: Контрактные тесты для API endpoints определены в contracts/auth-api.md
- **Test Strategy**: 
  - Unit тесты для сервисов (auth_service, jwt_service, password_service)
  - Контрактные тесты для API endpoints
  - Интеграционные тесты с тестовой БД

### Gate 2: Library-First
- **Status**: ✅ Pass
- **Implementation**: Каждый сервис — самодостаточный модуль:
  - `auth_service` — регистрация, вход, выход
  - `jwt_service` — генерация и валидация JWT
  - `password_service` — хэширование и проверка паролей
  - `rate_limiter` — защита от brute-force

### Gate 3: Simplicity (YAGNI)
- **Status**: ✅ Pass
- **Implementation**: Минимальная функциональность:
  - Только регистрация, вход, выход (без восстановления пароля)
  - JWT без refresh токенов
  - In-memory rate limiting (без Redis)
  - Один способ аутентификации (email + пароль)

**GATE RESULT**: ✅ All gates passed

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py          # Модель пользователя
│   │   └── token.py         # Модель токена доступа
│   ├── services/
│   │   ├── auth_service.py  # Регистрация, вход, выход
│   │   ├── jwt_service.py   # JWT операции
│   │   └── password_service.py  # Хэширование паролей
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py      # API endpoints
│   │   │   └── middleware.py  # JWT middleware
│   │   └── schemas/
│   │       └── auth.py      # Request/Response schemas
│   └── middleware/
│       └── rate_limiter.py  # Rate limiting
└── tests/
    ├── contract/
    │   └── test_auth_api.py # Контрактные тесты API
    ├── integration/
    │   └── test_auth_flow.py  # Интеграционные тесты
    └── unit/
        ├── test_auth_service.py
        ├── test_jwt_service.py
        └── test_password_service.py
```

**Structure Decision**: 
- Backend структура соответствует конституции (Library-First)
- Модули разделены по ответственности (models, services, api)
- Тесты разделены по уровням (contract, integration, unit)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Интеграционные тесты с БД | Требуется для Test-First принципа | Unit-тесты без БД не покрывают сценарии с уникальностью email |
| Rate limiting | Защита от brute-force (FR-007) | Без rate limiting уязвимость безопасности |
| JWT middleware | Проверка токенов на каждом запросе | Ручная проверка в каждом endpoint нарушает Simplicity |

## Phase 0: Research Tasks

**Unknowns to resolve**:

1. **Language/Version**: Выбрать язык для backend (Python/Node.js/Go)
2. **Primary Dependencies**: Выбрать фреймворк для API (FastAPI/Express/Gin)
3. **Testing**: Выбрать фреймворк для тестирования (pytest/Jest)
4. **JWT Library**: Выбрать библиотеку для JWT (PyJWT/jose)
5. **Password Hashing**: Выбрать алгоритм (bcrypt/argon2)

**Dispatch research agents**:
- Task: "Research backend language for authentication API (Python vs Node.js vs Go)"
- Task: "Research API frameworks for authentication endpoints"
- Task: "Research JWT libraries and best practices"
- Task: "Research password hashing algorithms (bcrypt vs argon2)"
- Task: "Research rate limiting patterns for authentication APIs"
