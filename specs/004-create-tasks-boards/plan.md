# Implementation Plan: Создание задач и привязка к доскам

**Branch**: `004-create-tasks-boards` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for task creation and board assignment

## Summary

**Primary requirement**: Реализовать API для создания, чтения, обновления и перемещения задач в колонках досок с гибкой системой прав доступа и назначением исполнителей.

**Technical approach**: REST API на Python/FastAPI с использованием SQLAlchemy для работы с PostgreSQL, интеграция с existing auth API (002-auth-api) и boards CRUD API (003-task-boards-crud), optimistic locking для конфликтов, soft delete для задач.

## Technical Context

**Language/Version**: Python 3.11+ (из existing auth API)
**Primary Dependencies**: FastAPI, SQLAlchemy (async), PyJWT (из auth API), psycopg2, asyncpg
**Storage**: PostgreSQL 15+ (из 001-local-dev-env)
**Testing**: pytest + pytest-asyncio (из existing setup)
**Target Platform**: macOS, Linux, Windows (WSL)
**Project Type**: Backend API (веб-приложение)
**Performance Goals**: Создание задачи ≤2 сек, список задач ≤1 сек, 95% операций успешны с первого раза
**Constraints**: 2GB RAM мин., 1 ядро CPU мин., поддержка 100+ одновременных запросов, optimistic locking для конфликтов
**Scale/Scope**: CRUD API для задач с интеграцией в existing boards API, до 100 задач на доску, до 10 одновременных пользователей на доску

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Test-First (NON-NEGOTIABLE)
- **Status**: ✅ Pass (Phase 2)
- **Implementation**: Контрактные тесты для API endpoints, unit тесты для сервисов, integration тесты для flows
- **Test Strategy**:
  - Unit тесты для task_service, column_service
  - Контрактные тесты для CRUD endpoints
  - Интеграционные тесты с тестовой БД

### Gate 2: Library-First
- **Status**: ✅ Pass
- **Implementation**: Каждый сервис — самодостаточный модуль:
  - `task_service` — CRUD операции с задачами
  - `column_service` — управление колонками
  - Интеграция с `board_service` и `permission_service` из 003

### Gate 3: Simplicity (YAGNI)
- **Status**: ✅ Pass
- **Implementation**: Минимальная функциональность:
  - Базовые атрибуты задачи (название, описание, исполнитель, позиция)
  - Статус определяется колонкой (без дополнительных статусов)
  - Optimistic locking для конфликтов (без field-level locking)
  - Soft delete через existing модель

**GATE RESULT**: ✅ All gates passed

## Project Structure

### Documentation (this feature)

```text
specs/004-create-tasks-boards/
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
│   │   └── task.py        # Модель задачи (существует в 003)
│   ├── services/
│   │   ├── task_service.py         # CRUD для задач
│   │   └── column_service.py       # Управление колонками
│   ├── api/
│   │   ├── routes/
│   │   │   ├── tasks.py      # API endpoints для задач
│   │   │   └── columns.py    # API для колонок
│   │   └── schemas/
│   │       ├── task.py       # Request/Response schemas
│   │       └── column.py     # Column schemas
│   └── middleware/
│       └── optimistic_lock.py  # Middleware для optimistic locking
└── tests/
    ├── contract/
    │   ├── test_tasks_crud.py
    │   └── test_columns.py
    ├── integration/
    │   └── test_task_flows.py
    └── unit/
        ├── test_task_service.py
        └── test_column_service.py
```

**Structure Decision**: Используем существующую структуру backend из 003-task-boards-crud. Добавляем новые сервисы и endpoints в соответствующие директории.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Optimistic locking | Требуется для обработки конфликтов одновременного редактирования (FR-019) | Без locking данные могут быть перезаписаны, что нарушает целостность |
| Assignee permissions | Расширенная модель прав для исполнителей (Clarification #1) | Простая модель (только owner/admin) нарушает requirement независимости исполнителя |
