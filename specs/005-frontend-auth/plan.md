# Implementation Plan: Фронтенд регистрации и авторизации пользователей

**Branch**: `005-frontend-auth` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for frontend authentication UI

## Summary

**Primary requirement**: Реализовать пользовательский интерфейс для регистрации, входа, выхода и восстановления пароля с использованием React + TypeScript.

**Technical approach**: React SPA на Vite с TypeScript, React Router для маршрутизации, localStorage для JWT токенов, интеграция с existing auth API (002-auth-api).

## Technical Context

**Language/Version**: TypeScript 5+ (из clarifications spec.md)
**Primary Dependencies**: React 18+, React Router 6+, Vite
**Storage**: localStorage для JWT токена
**Testing**: Vitest + React Testing Library (стандарт для React)
**Target Platform**: Веб-браузеры (Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (веб-приложение)
**Performance Goals**: Регистрация < 1 мин, вход < 30 сек, 95% успешных операций, отклик < 2 сек
**Constraints**: Responsive design (320px-1920px), localStorage для токена, интеграция с backend API
**Scale/Scope**: 6 страниц (/login, /register, /forgot-password, /reset-password, /profile, /dashboard, /), 6 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Test-First (NON-NEGOTIABLE)
- **Status**: ✅ Pass (Phase 2)
- **Implementation**: Компонентные тесты для UI компонентов, интеграционные тесты для форм, E2E тесты для пользовательских сценариев
- **Test Strategy**:
  - Unit тесты для компонентов (кнопки, поля ввода, валидация)
  - Integration тесты для форм (регистрация, вход)
  - E2E тесты для полных пользовательских сценариев

### Gate 2: Library-First
- **Status**: ✅ Pass
- **Implementation**: Каждый компонент — самодостаточный модуль:
  - `components/` — переиспользуемые UI компоненты (Button, Input, Form)
  - `pages/` — страницы приложения (LoginPage, RegisterPage, Dashboard)
  - `services/` — API сервисы (authService)
  - `hooks/` — кастомные хуки (useAuth, useNavigate)

### Gate 3: Simplicity (YAGNI)
- **Status**: ✅ Pass
- **Implementation**: Минимальная функциональность:
  - 6 страниц для основных сценариев
  - Базовая валидация форм
  - Простая маршрутизация с guard для защищённых страниц
  - Без избыточных анимаций и сложных UI эффектов

**GATE RESULT**: ✅ All gates passed

## Project Structure

### Documentation (this feature)

```text
specs/005-frontend-auth/
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
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── FormError.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/
│   │   └── authService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useNavigate.ts
│   ├── types/
│   │   └── auth.ts
│   ├── utils/
│   │   └── validation.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── components/
│   ├── pages/
│   └── e2e/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Structure Decision**: Используем структуру frontend/ с разделением на components, pages, services, hooks. Соответствует React best practices и конституции (Library-First).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 6 страниц | Требуется для полного UX (регистрация, вход, восстановление, профиль, dashboard) | Минимальная версия (3 страницы) нарушает requirement FR-016—FR-018 |
| localStorage для токена | Clarification от пользователя (сохранение сессии) | sessionStorage требует повторного входа при закрытии вкладки |
