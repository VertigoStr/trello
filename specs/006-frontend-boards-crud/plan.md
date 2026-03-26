# Implementation Plan: Создание и удаление досок на фронтенде

**Branch**: `006-frontend-boards-crud` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for frontend boards CRUD UI

## Summary

**Primary requirement**: Реализовать пользовательский интерфейс для создания, просмотра списка, редактирования и удаления досок с использованием React + TypeScript + Bootstrap 5.

**Technical approach**: React SPA на Vite с TypeScript, модальные окна для создания/удаления/редактирования, интеграция с existing boards API (003-task-boards-crud), protected routes для аутентификации.

## Technical Context

**Language/Version**: TypeScript 5+ (из 005-frontend-auth)
**Primary Dependencies**: React 18+, React Router 6+, Bootstrap 5, Vite
**Storage**: localStorage для JWT токена (из 005-frontend-auth)
**Testing**: Vitest + React Testing Library (стандарт для React)
**Target Platform**: Веб-браузеры (Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (веб-приложение)
**Performance Goals**: Создание доски < 30 сек, список досок < 1 сек, 95% успешных операций, отклик < 2 сек
**Constraints**: Responsive design (320px-1920px), модальные окна для CRUD операций, подтверждение удаления с вводом названия
**Scale/Scope**: 5 страниц/компонентов (Dashboard, BoardDetail, CreateBoardModal, EditBoardModal, DeleteBoardModal), 5 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Test-First (NON-NEGOTIABLE)
- **Status**: ✅ Pass (Phase 2)
- **Implementation**: Компонентные тесты для UI компонентов, интеграционные тесты для форм и потоков, E2E тесты для пользовательских сценариев
- **Test Strategy**:
  - Unit тесты для компонентов (модальные окна, кнопки, формы)
  - Integration тесты для CRUD потоков (создание, редактирование, удаление)
  - E2E тесты для полных пользовательских сценариев

### Gate 2: Library-First
- **Status**: ✅ Pass
- **Implementation**: Каждый компонент — самодостаточный модуль:
  - `components/boards/` — компоненты для работы с досками (BoardCard, BoardList, BoardModal)
  - `pages/DashboardPage` — главная страница со списком досок
  - `pages/BoardDetailPage` — детальная страница доски
  - `services/boardService.ts` — API сервис для досок
  - `hooks/useBoards.ts` — хук для управления состоянием досок

### Gate 3: Simplicity (YAGNI)
- **Status**: ✅ Pass
- **Implementation**: Минимальная функциональность:
  - 5 основных компонентов для CRUD операций
  - Модальные окна на основе Bootstrap 5 Modal
  - Простая валидация форм
  - Подтверждение удаления с вводом названия доски

**GATE RESULT**: ✅ All gates passed

## Project Structure

### Documentation (this feature)

```text
specs/006-frontend-boards-crud/
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
│   │   ├── boards/
│   │   │   ├── BoardCard.tsx       # Карточка доски в списке
│   │   │   ├── BoardList.tsx       # Список досок
│   │   │   ├── CreateBoardModal.tsx # Модальное окно создания
│   │   │   ├── EditBoardModal.tsx   # Модальное окно редактирования
│   │   │   └── DeleteBoardModal.tsx # Модальное окно удаления
│   │   └── common/
│   │       └── ... (из 005-frontend-auth)
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Главная страница со списком досок
│   │   └── BoardDetailPage.tsx     # Детальная страница доски
│   ├── services/
│   │   └── boardService.ts         # API сервис для досок
│   ├── hooks/
│   │   └── useBoards.ts            # Хук для управления досками
│   ├── types/
│   │   └── board.ts                # TypeScript типы для досок
│   └── utils/
│       └── validation.ts           # Утилиты валидации (из 005)
├── tests/
│   ├── components/boards/          # Тесты компонентов досок
│   ├── pages/                      # Тесты страниц
│   └── integration/                # Integration тесты
└── ...
```

**Structure Decision**: Используем существующую структуру frontend из 005-frontend-auth. Добавляем компоненты для досок в `components/boards/`, сервис `boardService.ts`, хук `useBoards.ts`. Соответствует React best practices и конституции (Library-First).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Модальные окна для CRUD | Clarification от пользователя (UX consistency) | Отдельные страницы требуют больше навигации и сложнее в реализации |
| Подтверждение удаления с вводом названия | Безопасность от случайного удаления | Простое подтверждение (OK/Cancel) не обеспечивает достаточной защиты |
