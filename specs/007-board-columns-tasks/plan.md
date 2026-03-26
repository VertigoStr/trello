# Implementation Plan: Доска с колонками и задачами

**Branch**: `007-board-columns-tasks` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for board columns and tasks management UI

## Summary

**Primary requirement**: Реализовать пользовательский интерфейс для управления колонками и задачами на доске с возможностью создания, редактирования, перемещения и удаления.

**Technical approach**: React SPA на Vite с TypeScript, drag-and-drop для перемещения задач, модальные окна для CRUD операций, интеграция с existing columns/tasks API (003-task-boards-crud).

## Technical Context

**Language/Version**: TypeScript 5+ (из 005-frontend-auth)
**Primary Dependencies**: React 18+, React Router 6+, Bootstrap 5, Vite, @dnd-kit (для drag-and-drop)
**Storage**: localStorage для JWT токена (из 005-frontend-auth)
**Testing**: Vitest + React Testing Library (стандарт для React)
**Target Platform**: Веб-браузеры (Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (веб-приложение)
**Performance Goals**: Создание колонки < 10 сек, создание задачи < 15 сек, перемещение задачи < 5 сек, загрузка доски < 2 сек
**Constraints**: Responsive design (320px-1920px), drag-and-drop для перемещения задач, подтверждение перед удалением колонки
**Scale/Scope**: 7 страниц/компонентов (BoardDetail, ColumnCard, TaskCard, CreateColumnModal, CreateTaskModal, EditTaskModal, DeleteConfirmModal), 7 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Test-First (NON-NEGOTIABLE)
- **Status**: ✅ Pass (Phase 2)
- **Implementation**: Компонентные тесты для UI компонентов, интеграционные тесты для CRUD потоков и drag-and-drop, E2E тесты для пользовательских сценариев
- **Test Strategy**:
  - Unit тесты для компонентов (ColumnCard, TaskCard, модальные окна)
  - Integration тесты для CRUD потоков (создание колонки, создание задачи, перемещение)
  - E2E тесты для полных пользовательских сценариев

### Gate 2: Library-First
- **Status**: ✅ Pass
- **Implementation**: Каждый компонент — самодостаточный модуль:
  - `components/board/` — компоненты для работы с доской (BoardDetail, ColumnCard, TaskCard)
  - `components/modals/` — модальные окна для CRUD операций
  - `pages/BoardDetailPage` — детальная страница доски
  - `services/columnService.ts` — API сервис для колонок
  - `services/taskService.ts` — API сервис для задач
  - `hooks/useBoard.ts` — хук для управления состоянием доски

### Gate 3: Simplicity (YAGNI)
- **Status**: ✅ Pass
- **Implementation**: Минимальная функциональность:
  - 7 основных компонентов для CRUD операций
  - Модальные окна на основе Bootstrap 5 Modal
  - Drag-and-drop через @dnd-kit library
  - Подтверждение перед удалением колонки

**GATE RESULT**: ✅ All gates passed

## Project Structure

### Documentation (this feature)

```text
specs/007-board-columns-tasks/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (frontend data models)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── board/
│   │   │   ├── BoardDetail.tsx       # Детальная страница доски
│   │   │   ├── ColumnCard.tsx        # Карточка колонки
│   │   │   ├── TaskCard.tsx          # Карточка задачи
│   │   │   └── TaskList.tsx          # Список задач в колонке
│   │   ├── modals/
│   │   │   ├── CreateColumnModal.tsx # Создание колонки
│   │   │   ├── CreateTaskModal.tsx   # Создание задачи
│   │   │   ├── EditTaskModal.tsx     # Редактирование задачи
│   │   │   └── DeleteConfirmModal.tsx # Подтверждение удаления
│   │   └── common/
│   │       └── ... (из 005-frontend-auth)
│   ├── pages/
│   │   └── BoardDetailPage.tsx       # Страница доски
│   ├── services/
│   │   ├── columnService.ts          # API сервис для колонок
│   │   └── taskService.ts            # API сервис для задач
│   ├── hooks/
│   │   └── useBoard.ts               # Хук для управления доской
│   ├── types/
│   │   ├── column.ts                 # Типы для колонок
│   │   └── task.ts                   # Типы для задач
│   └── utils/
│       └── validation.ts             # Утилиты валидации (из 005)
├── tests/
│   ├── components/board/             # Тесты компонентов доски
│   ├── components/modals/            # Тесты модальных окон
│   ├── pages/                        # Тесты страниц
│   └── integration/                  # Integration тесты
└── ...
```

**Structure Decision**: Используем существующую структуру frontend из 005-frontend-auth. Добавляем компоненты для колонок и задач в `components/board/` и `components/modals/`, сервисы `columnService.ts` и `taskService.ts`, хук `useBoard.ts`. Соответствует React best practices и конституции (Library-First).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Drag-and-drop библиотека | Требуется для интуитивного перемещения задач | Реализация своего drag-and-drop сложнее и требует больше времени |
| Модальные окна для CRUD | Clarification от пользователя (UX consistency) | Inline формы менее интуитивны для CRUD операций |
