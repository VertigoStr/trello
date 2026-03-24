# Phase 0 Research: Authentication & Registration API

**Feature**: 002-auth-api  
**Date**: 2026-03-24  
**Purpose**: Resolve all NEEDS CLARIFICATION items from Technical Context

---

## 1. Backend Language Choice

**Decision**: Python 3.11+

**Rationale**:
- Быстрая разработка благодаря выразительному синтаксису
- Богатая экосистема библиотек для аутентификации
- Отличная поддержка type hints для безопасности кода
- Соответствует принципу Simplicity (YAGNI) — проще чем Go для CRUD API
- Хорошая интеграция с PostgreSQL

**Alternatives considered**:
- Node.js: асинхронность не критична для auth API, TypeScript требует дополнительной настройки
- Go: строже, но больше boilerplate кода для простой CRUD логики

---

## 2. API Framework

**Decision**: FastAPI

**Rationale**:
- Автоматическая валидация данных через Pydantic
- Встроенная документация (OpenAPI/Swagger)
- Асинхронная поддержка для будущих расширений
- Type-safe благодаря type hints
- Быстрая разработка (меньше boilerplate)

**Alternatives considered**:
- Flask: проще, но требует дополнительных расширений для валидации
- Django REST Framework: избыточен для простого auth API
- Express (Node.js): требует TypeScript для type safety

---

## 3. Testing Framework

**Decision**: pytest + pytest-asyncio

**Rationale**:
- Де-факто стандарт для Python тестирования
- Фикстуры для setup/teardown тестового окружения
- Параметризация тестов для покрытия различных сценариев
- Отличная интеграция с FastAPI через TestClient
- Поддержка async тестов для API endpoints

**Alternatives considered**:
- unittest: встроен, но менее выразительный
- hypothesis: property-based тестирование избыточно для auth API

---

## 4. JWT Library

**Decision**: PyJWT

**Rationale**:
- Официальная библиотека JWT для Python
- Поддержка всех необходимых алгоритмов (HS256, RS256)
- Регулярные обновления безопасности
- Простой API для генерации и валидации токенов
- Широкая документация и community support

**Alternatives considered**:
- python-jose: поддерживает больше алгоритмов, но сложнее
- authlib: мощная, но избыточная для простого JWT

---

## 5. Password Hashing

**Decision**: bcrypt

**Rationale**:
- Адаптивная функция хэширования (cost factor)
- Устойчивость к rainbow table атакам
- Встроенная соль для каждого хэша
- Отличная поддержка в Python (bcrypt библиотека)
- Соответствует лучшим практикам OWASP

**Alternatives considered**:
- argon2: новее и безопаснее, но сложнее в настройке
- PBKDF2: встроен в Python, но медленнее bcrypt
- scrypt: хорош, но менее распространён

---

## 6. Rate Limiting

**Decision**: In-memory rate limiting с sliding window

**Rationale**:
- Простота реализации без внешних зависимостей
- Достаточно для защиты от brute-force
- Sliding window точнее fixed window
- Хранение счётчиков в памяти (для начала)
- Легкая миграция на Redis при масштабировании

**Alternatives considered**:
- Redis-based rate limiting: требует внешнего сервиса
- Token bucket: сложнее в реализации
- Fixed window: менее точный, позволяет burst на границах

---

## Summary of Resolved Clarifications

| Category | Decision |
|----------|----------|
| Language/Version | Python 3.11+ |
| Primary Dependencies | FastAPI, PyJWT, bcrypt, SQLAlchemy |
| Testing | pytest + pytest-asyncio |
| Storage | PostgreSQL 15+ (из локального окружения) |
| JWT Algorithm | HS256 (symmetric key) |
| Password Hashing | bcrypt (cost factor 12) |
| Rate Limiting | In-memory sliding window |

---

## Next Steps (Phase 1)

1. Создать `data-model.md` с моделями User и Token
2. Создать API контракты в `contracts/` для endpoints:
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
3. Создать `quickstart.md` с инструкциями по запуску
4. Обновить agent context с новыми технологиями
