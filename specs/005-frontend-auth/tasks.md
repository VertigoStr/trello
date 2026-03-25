# Tasks: Фронтенд регистрации и авторизации пользователей

**Input**: Design documents from `/specs/005-frontend-auth/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/auth-api.md, research.md, quickstart.md

**Tests**: Tests are MANDATORY per Constitution (Test-First principle). Component tests, integration tests, and E2E tests included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`, `frontend/tests/`
- Components: `frontend/src/components/`
- Pages: `frontend/src/pages/`
- Services: `frontend/src/services/`
- Hooks: `frontend/src/hooks/`
- Types: `frontend/src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create frontend directory structure: frontend/src/{components,pages,services,hooks,types,utils}
- [ ] T002 [P] Initialize React + TypeScript + Vite project: frontend/package.json, frontend/vite.config.ts
- [ ] T003 [P] Configure TypeScript: frontend/tsconfig.json with strict mode
- [ ] T004 [P] Install dependencies: React 18+, React Router 6+, Vitest, React Testing Library
- [ ] T005 [P] Configure ESLint and Prettier for React/TypeScript

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [P] Create base types: frontend/src/types/auth.ts (User, AuthTokens, AuthState, ApiResponse)
- [ ] T007 [P] Create validation utilities: frontend/src/utils/validation.ts (email, password, name validation)
- [ ] T008 [P] Create authService: frontend/src/services/authService.ts (API integration with 002-auth-api)
- [ ] T009 [P] Create useAuth hook: frontend/src/hooks/useAuth.ts (authentication state management)
- [ ] T010 [P] Create common UI components: frontend/src/components/common/{Button,Input,FormError}.tsx
- [ ] T011 [P] Create ProtectedRoute component: frontend/src/components/layout/ProtectedRoute.tsx
- [ ] T012 [P] Create Header component with logout: frontend/src/components/layout/Header.tsx
- [ ] T013 [P] Setup React Router: frontend/src/App.tsx with route configuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Регистрация нового пользователя (Priority: P1) 🎯 MVP

**Goal**: Реализовать страницу регистрации с валидацией и интеграцией с backend

**Independent Test**: Пользователь может открыть страницу регистрации, заполнить форму и создать аккаунт, после чего перенаправляется на главную страницу

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Component test for RegisterPage form validation in frontend/tests/pages/RegisterPage.test.tsx
- [ ] T015 [P] [US1] Integration test for registration flow in frontend/tests/integration/RegisterFlow.test.tsx
- [ ] T016 [P] [US1] Test for email validation in frontend/tests/utils/validation.test.ts

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create RegisterPage component: frontend/src/pages/RegisterPage.tsx
- [ ] T018 [P] [US1] Add form state management with useState in frontend/src/pages/RegisterPage.tsx
- [ ] T019 [US1] Implement client-side validation (email, password, name) in frontend/src/pages/RegisterPage.tsx
- [ ] T020 [US1] Integrate with authService.register() in frontend/src/services/authService.ts
- [ ] T021 [US1] Add error handling for API errors (email exists, network errors) in frontend/src/pages/RegisterPage.tsx
- [ ] T022 [US1] Add redirect to /dashboard after successful registration in frontend/src/pages/RegisterPage.tsx
- [ ] T023 [US1] Add loading state during registration in frontend/src/pages/RegisterPage.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Вход в систему (Priority: P1)

**Goal**: Реализовать страницу входа с валидацией и сохранением токена

**Independent Test**: Пользователь может открыть страницу входа, ввести credentials и успешно аутентифицироваться

### Tests for User Story 2

- [ ] T024 [P] [US2] Component test for LoginPage form validation in frontend/tests/pages/LoginPage.test.tsx
- [ ] T025 [P] [US2] Integration test for login flow in frontend/tests/integration/LoginFlow.test.tsx
- [ ] T026 [P] [US2] Test for token storage in localStorage in frontend/tests/services/authService.test.ts

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create LoginPage component: frontend/src/pages/LoginPage.tsx
- [ ] T028 [P] [US2] Add form state management with useState in frontend/src/pages/LoginPage.tsx
- [ ] T029 [US2] Implement client-side validation (email format, password required) in frontend/src/pages/LoginPage.tsx
- [ ] T030 [US2] Integrate with authService.login() in frontend/src/services/authService.ts
- [ ] T031 [US2] Implement token storage to localStorage in frontend/src/services/authService.ts
- [ ] T032 [US2] Add redirect to / after successful login in frontend/src/pages/LoginPage.tsx
- [ ] T033 [US2] Add error handling for invalid credentials, account locked in frontend/src/pages/LoginPage.tsx
- [ ] T034 [US2] Add link to /forgot-password page in frontend/src/pages/LoginPage.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Выход из системы (Priority: P2)

**Goal**: Реализовать кнопку выхода с очисткой токена и перенаправлением

**Independent Test**: Пользователь может нажать кнопку выхода и вернуться на страницу входа

### Tests for User Story 3

- [ ] T035 [P] [US3] Test for logout functionality in frontend/tests/hooks/useAuth.test.ts
- [ ] T036 [P] [US3] Test for ProtectedRoute redirect after logout in frontend/tests/components/ProtectedRoute.test.tsx

### Implementation for User Story 3

- [ ] T037 [P] [US3] Implement authService.logout() in frontend/src/services/authService.ts
- [ ] T038 [US3] Add logout button to Header component in frontend/src/components/layout/Header.tsx
- [ ] T039 [US3] Implement token removal from localStorage in frontend/src/services/authService.ts
- [ ] T040 [US3] Add redirect to /login after logout in frontend/src/components/layout/Header.tsx
- [ ] T041 [US3] Update useAuth hook to handle logout state in frontend/src/hooks/useAuth.ts

**Checkpoint**: At this point, User Stories 1-3 should all work independently

---

## Phase 6: User Story 4 - Просмотр профиля пользователя (Priority: P2)

**Goal**: Реализовать страницу профиля с возможностью редактирования имени

**Independent Test**: Пользователь может открыть страницу профиля и увидеть свои данные

### Tests for User Story 4

- [ ] T042 [P] [US4] Component test for ProfilePage in frontend/tests/pages/ProfilePage.test.tsx
- [ ] T043 [P] [US4] Integration test for profile edit flow in frontend/tests/integration/ProfileFlow.test.tsx

### Implementation for User Story 4

- [ ] T044 [P] [US4] Create ProfilePage component: frontend/src/pages/ProfilePage.tsx
- [ ] T045 [US4] Fetch current user data with authService.getCurrentUser() in frontend/src/pages/ProfilePage.tsx
- [ ] T046 [US4] Display user name and email in frontend/src/pages/ProfilePage.tsx
- [ ] T047 [US4] Add edit form for name update in frontend/src/pages/ProfilePage.tsx
- [ ] T048 [US4] Integrate with backend API for name update (if available) in frontend/src/services/authService.ts
- [ ] T049 [US4] Add ProtectedRoute wrapper for /profile route in frontend/src/App.tsx

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Просмотр списка досок (Priority: P2)

**Goal**: Реализовать главную страницу со списком досок пользователя

**Independent Test**: Пользователь видит список досок после входа в систему

### Tests for User Story 5

- [ ] T050 [P] [US5] Component test for DashboardPage in frontend/tests/pages/DashboardPage.test.tsx
- [ ] T051 [P] [US5] Integration test for dashboard flow in frontend/tests/integration/DashboardFlow.test.tsx

### Implementation for User Story 5

- [ ] T052 [P] [US5] Create DashboardPage component: frontend/src/pages/DashboardPage.tsx
- [ ] T053 [US5] Fetch user's boards from backend API (003-task-boards-crud) in frontend/src/pages/DashboardPage.tsx
- [ ] T054 [US5] Display list of boards with titles in frontend/src/pages/DashboardPage.tsx
- [ ] T055 [US5] Add empty state message "У вас пока нет досок" in frontend/src/pages/DashboardPage.tsx
- [ ] T056 [US5] Add ProtectedRoute wrapper for / route in frontend/src/App.tsx
- [ ] T057 [US5] Add navigation to board detail page (future feature) in frontend/src/pages/DashboardPage.tsx

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Восстановление доступа (Priority: P3)

**Goal**: Реализовать страницы восстановления и сброса пароля

**Independent Test**: Пользователь может запросить сброс пароля и установить новый пароль

### Tests for User Story 6

- [ ] T058 [P] [US6] Component test for ForgotPasswordPage in frontend/tests/pages/ForgotPasswordPage.test.tsx
- [ ] T059 [P] [US6] Component test for ResetPasswordPage in frontend/tests/pages/ResetPasswordPage.test.tsx
- [ ] T060 [P] [US6] Integration test for password reset flow in frontend/tests/integration/PasswordResetFlow.test.tsx

### Implementation for User Story 6

- [ ] T061 [P] [US6] Create ForgotPasswordPage component: frontend/src/pages/ForgotPasswordPage.tsx
- [ ] T062 [US6] Implement email form and validation in frontend/src/pages/ForgotPasswordPage.tsx
- [ ] T063 [US6] Integrate with authService.forgotPassword() in frontend/src/services/authService.ts
- [ ] T064 [US6] Add success message after email sent in frontend/src/pages/ForgotPasswordPage.tsx
- [ ] T065 [P] [US6] Create ResetPasswordPage component: frontend/src/pages/ResetPasswordPage.tsx
- [ ] T066 [US6] Parse reset token from URL query params in frontend/src/pages/ResetPasswordPage.tsx
- [ ] T067 [US6] Implement new password form with validation in frontend/src/pages/ResetPasswordPage.tsx
- [ ] T068 [US6] Integrate with authService.resetPassword() in frontend/src/services/authService.ts
- [ ] T069 [US6] Add redirect to /login after successful reset in frontend/src/pages/ResetPasswordPage.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T070 [P] Add responsive CSS for mobile devices (320px-768px) in frontend/src/styles/
- [ ] T071 [P] Add loading skeletons for pages in frontend/src/components/common/LoadingSkeleton.tsx
- [ ] T072 [P] Add error boundary component in frontend/src/components/common/ErrorBoundary.tsx
- [ ] T073 [P] Add toast notifications for success/error messages in frontend/src/components/common/Toast.tsx
- [ ] T074 [P] Add E2E tests with Playwright in frontend/tests/e2e/auth.spec.ts
- [ ] T075 [P] Add accessibility (a11y) tests in frontend/tests/a11y/
- [ ] T076 [P] Configure CI/CD pipeline for frontend in .github/workflows/frontend.yml
- [ ] T077 [P] Add Docker configuration for frontend in frontend/Dockerfile
- [ ] T078 Run full test suite (unit + integration + E2E)
- [ ] T079 Run quickstart.md validation (follow all steps end-to-end)
- [ ] T080 [P] Add JSDoc comments to all public functions
- [ ] T081 [P] Add README.md for frontend with setup instructions

**Phase 9 Complete**: All polish tasks finished!

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US2 (login first)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on useAuth hook
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Depends on useAuth hook
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Independent

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before pages
- Services before integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T005)
- All Foundational tasks marked [P] can run in parallel (T006-T013)
- Once Foundational phase completes:
  - Developer A: User Story 1 (registration)
  - Developer B: User Story 2 (login)
  - Developer C: User Story 6 (password reset)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Component test for RegisterPage form validation"
Task: "Integration test for registration flow"
Task: "Test for email validation"

# Launch all components for User Story 1 together:
Task: "Create RegisterPage component"
Task: "Add form state management with useState"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Registration)
4. Complete Phase 4: User Story 2 (Login)
5. **STOP and VALIDATE**: Test registration and login
   - Register new user
   - Login with credentials
   - Verify redirect to dashboard
   - Verify token stored in localStorage
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Registration) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Login) → Test independently → Deploy/Demo
4. Add User Story 3 (Logout) → Test independently → Deploy/Demo
5. Add User Story 4 (Profile) → Test independently → Deploy/Demo
6. Add User Story 5 (Dashboard) → Test independently → Deploy/Demo
7. Add User Story 6 (Password Reset) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (registration) + User Story 6 (password reset)
   - Developer B: User Story 2 (login) + User Story 3 (logout)
   - Developer C: User Story 4 (profile) + User Story 5 (dashboard)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Test-First principle)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Task Summary

| Phase | Total | Completed | Remaining | Description |
|-------|-------|-----------|-----------|-------------|
| Phase 1: Setup | 5 | 0 | 5 | Project structure, React + TypeScript + Vite |
| Phase 2: Foundational | 8 | 0 | 8 | Types, validation, authService, hooks, components |
| Phase 3: US1 (Register) | 10 | 0 | 10 | Registration page with tests |
| Phase 4: US2 (Login) | 11 | 0 | 11 | Login page with tests |
| Phase 5: US3 (Logout) | 7 | 0 | 7 | Logout functionality with tests |
| Phase 6: US4 (Profile) | 8 | 0 | 8 | Profile page with tests |
| Phase 7: US5 (Dashboard) | 8 | 0 | 8 | Dashboard page with tests |
| Phase 8: US6 (Reset) | 12 | 0 | 12 | Password reset pages with tests |
| Phase 9: Polish | 12 | 0 | 12 | Responsive, E2E, CI/CD, Docker |
| **Total** | **81** | **0** | **81** | |

**Completion Status**: 0% (0/81 tasks completed)

**MVP Scope**: Phases 1-4 (34 tasks) - Registration + Login only
**Full Feature**: All phases (81 tasks) - Complete authentication UI with password reset
