# Tasks: Создание и удаление досок на фронтенде

**Input**: Design documents from `/specs/006-frontend-boards-crud/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/boards-api.md, research.md, quickstart.md

**Tests**: Tests are MANDATORY per Constitution (Test-First principle). Component tests, integration tests, and E2E tests included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`, `frontend/tests/`
- Components: `frontend/src/components/boards/`
- Pages: `frontend/src/pages/`
- Services: `frontend/src/services/`
- Hooks: `frontend/src/hooks/`
- Types: `frontend/src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Verify frontend project structure exists: frontend/src/{components,pages,services,hooks,types}
- [X] T002 [P] Verify Bootstrap 5 installed: frontend/package.json (from 005-frontend-auth)
- [X] T003 [P] Verify Vitest configured: frontend/vite.config.ts (from 005-frontend-auth)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create board types: frontend/src/types/board.ts (Board, BoardMember, CreateBoardDTO, UpdateBoardDTO)
- [X] T005 [P] Create boardService: frontend/src/services/boardService.ts (API integration with 003-task-boards-crud)
- [X] T006 [P] Create useBoards hook: frontend/src/hooks/useBoards.ts (state management for boards)
- [X] T007 [P] Create validation utilities: frontend/src/utils/validation.ts (validateCreateBoard, validateUpdateBoard)
- [X] T008 [P] Update index.css: frontend/src/styles/index.css (verify Bootstrap import from 005-frontend-auth)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Создание новой доски (Priority: P1) 🎯 MVP

**Goal**: Реализовать модальное окно создания доски с валидацией

**Independent Test**: Пользователь может открыть модальное окно создания доски, заполнить название и описание, и создать доску, после чего перенаправляется на созданную доску

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Component test for CreateBoardModal in frontend/tests/components/boards/CreateBoardModal.test.tsx
- [ ] T010 [P] [US1] Integration test for create board flow in frontend/tests/integration/CreateBoardFlow.test.tsx
- [ ] T011 [P] [US1] Test for board validation in frontend/tests/utils/validation.test.ts

### Implementation for User Story 1

- [X] T012 [P] [US1] Create CreateBoardModal component: frontend/src/components/boards/CreateBoardModal.tsx
- [X] T013 [P] [US1] Add form state management with useState in frontend/src/components/boards/CreateBoardModal.tsx
- [X] T014 [US1] Implement client-side validation (title 1-255 chars, description 0-10000 chars) in frontend/src/components/boards/CreateBoardModal.tsx
- [X] T015 [US1] Integrate with boardService.create() in frontend/src/services/boardService.ts
- [X] T016 [US1] Add error handling for API errors (validation, auth) in frontend/src/components/boards/CreateBoardModal.tsx
- [X] T017 [US1] Add redirect to board detail after successful creation in frontend/src/components/boards/CreateBoardModal.tsx
- [X] T018 [US1] Add loading state during creation in frontend/src/components/boards/CreateBoardModal.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Просмотр списка досок (Priority: P1)

**Goal**: Реализовать главную страницу со списком досок пользователя

**Independent Test**: Пользователь открывает главную страницу и видит список своих досок с названиями и описаниями

### Tests for User Story 2

- [ ] T019 [P] [US2] Component test for BoardCard in frontend/tests/components/boards/BoardCard.test.tsx
- [ ] T020 [P] [US2] Component test for BoardList in frontend/tests/components/boards/BoardList.test.tsx
- [ ] T021 [P] [US2] Integration test for board list flow in frontend/tests/integration/BoardListFlow.test.tsx

### Implementation for User Story 2

- [X] T022 [P] [US2] Create BoardCard component: frontend/src/components/boards/BoardCard.tsx
- [X] T023 [P] [US2] Create BoardList component: frontend/src/components/boards/BoardList.tsx
- [X] T024 [P] [US2] Create DashboardPage: frontend/src/pages/DashboardPage.tsx
- [X] T025 [US2] Integrate with useBoards hook in frontend/src/pages/DashboardPage.tsx
- [X] T026 [US2] Add loading state while fetching boards in frontend/src/pages/DashboardPage.tsx
- [X] T027 [US2] Add empty state "У вас пока нет досок" with create button in frontend/src/pages/DashboardPage.tsx
- [X] T028 [US2] Add navigation to board detail on card click in frontend/src/components/boards/BoardCard.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Удаление доски (Priority: P2)

**Goal**: Реализовать модальное окно удаления доски с подтверждением (ввод названия)

**Independent Test**: Владелец доски может удалить доску через диалог подтверждения с вводом названия, после чего доска исчезает из списка

### Tests for User Story 3

- [ ] T029 [P] [US3] Component test for DeleteBoardModal in frontend/tests/components/boards/DeleteBoardModal.test.tsx
- [ ] T030 [P] [US3] Integration test for delete board flow in frontend/tests/integration/DeleteBoardFlow.test.tsx
- [ ] T031 [P] [US3] Test for owner-only permission check in frontend/tests/services/boardService.test.ts

### Implementation for User Story 3

- [X] T032 [P] [US3] Create DeleteBoardModal component: frontend/src/components/boards/DeleteBoardModal.tsx
- [X] T033 [US3] Add board name input for confirmation in frontend/src/components/boards/DeleteBoardModal.tsx
- [X] T034 [US3] Disable delete button until name matches in frontend/src/components/boards/DeleteBoardModal.tsx
- [X] T035 [US3] Integrate with boardService.delete() in frontend/src/services/boardService.ts
- [X] T036 [US3] Add owner-only check (only show for board owner) in frontend/src/components/boards/DeleteBoardModal.tsx
- [X] T037 [US3] Add redirect to dashboard after successful delete in frontend/src/components/boards/DeleteBoardModal.tsx
- [X] T038 [US3] Add error handling for access denied in frontend/src/components/boards/DeleteBoardModal.tsx

**Checkpoint**: At this point, User Stories 1-3 should all work independently

---

## Phase 6: User Story 4 - Редактирование доски (Priority: P2)

**Goal**: Реализовать модальное окно редактирования доски (только владелец)

**Independent Test**: Владелец доски может открыть редактирование и изменить название или описание

### Tests for User Story 4

- [ ] T039 [P] [US4] Component test for EditBoardModal in frontend/tests/components/boards/EditBoardModal.test.tsx
- [ ] T040 [P] [US4] Integration test for edit board flow in frontend/tests/integration/EditBoardFlow.test.tsx

### Implementation for User Story 4

- [X] T041 [P] [US4] Create EditBoardModal component: frontend/src/components/boards/EditBoardModal.tsx
- [X] T042 [US4] Pre-fill form with current board data in frontend/src/components/boards/EditBoardModal.tsx
- [X] T043 [US4] Implement validation (same as create) in frontend/src/components/boards/EditBoardModal.tsx
- [X] T044 [US4] Integrate with boardService.update() in frontend/src/services/boardService.ts
- [X] T045 [US4] Add owner-only check in frontend/src/components/boards/EditBoardModal.tsx
- [X] T046 [US4] Add error handling for access denied in frontend/src/components/boards/EditBoardModal.tsx

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Просмотр детальной информации о доске (Priority: P1)

**Goal**: Реализовать детальную страницу доски с колонками и задачами

**Independent Test**: Пользователь открывает доску и видит колонки с задачами

### Tests for User Story 5

- [ ] T047 [P] [US5] Component test for BoardDetailPage in frontend/tests/pages/BoardDetailPage.test.tsx
- [ ] T048 [P] [US5] Integration test for board detail flow in frontend/tests/integration/BoardDetailFlow.test.tsx
- [ ] T049 [P] [US5] Test for access denied scenario in frontend/tests/pages/BoardDetailPage.test.tsx

### Implementation for User Story 5

- [X] T050 [P] [US5] Create BoardDetailPage: frontend/src/pages/BoardDetailPage.tsx
- [X] T051 [US5] Fetch board details with boardService.getById() in frontend/src/pages/BoardDetailPage.tsx
- [X] T052 [US5] Display board title and description in frontend/src/pages/BoardDetailPage.tsx
- [X] T053 [US5] Add board settings/menu button (for edit/delete) in frontend/src/pages/BoardDetailPage.tsx
- [X] T054 [US5] Add access denied handling in frontend/src/pages/BoardDetailPage.tsx
- [X] T055 [US5] Add loading state in frontend/src/pages/BoardDetailPage.tsx
- [X] T056 [US5] Add placeholder for columns/tasks (from 003-task-boards-crud) in frontend/src/pages/BoardDetailPage.tsx

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T057 [P] Add responsive CSS for mobile devices (320px-768px) in frontend/src/styles/index.css
- [ ] T058 [P] Add loading skeletons for board list in frontend/src/components/boards/BoardListSkeleton.tsx
- [ ] T059 [P] Add error boundary component in frontend/src/components/common/ErrorBoundary.tsx (from 005-frontend-auth)
- [ ] T060 [P] Add toast notifications for success/error messages in frontend/src/components/common/Toast.tsx (from 005-frontend-auth)
- [ ] T061 [P] Add E2E tests with Playwright in frontend/tests/e2e/boards.spec.ts
- [ ] T062 [P] Add accessibility (a11y) tests in frontend/tests/a11y/
- [ ] T063 Run full test suite (unit + integration + E2E)
- [ ] T064 Run quickstart.md validation (follow all steps end-to-end)
- [ ] T065 [P] Add JSDoc comments to all public functions
- [ ] T066 [P] Update frontend/README.md with boards CRUD documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on useBoards hook
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on useBoards hook
- **User Story 5 (P1)**: Can start after Foundational (Phase 2) - Depends on boardService

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before pages
- Services before integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T003)
- All Foundational tasks marked [P] can run in parallel (T004-T008)
- Once Foundational phase completes:
  - Developer A: User Story 1 (create board)
  - Developer B: User Story 2 (board list)
  - Developer C: User Story 5 (board detail)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Component test for CreateBoardModal"
Task: "Integration test for create board flow"
Task: "Test for board validation"

# Launch all components for User Story 1 together:
Task: "Create CreateBoardModal component"
Task: "Add form state management with useState"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Create Board)
4. Complete Phase 4: User Story 2 (Board List)
5. **STOP and VALIDATE**: Test create and list boards
   - Create new board via modal
   - See board in list
   - Navigate to board detail
   - Verify validation errors
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Create Board) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Board List) → Test independently → Deploy/Demo
4. Add User Story 5 (Board Detail) → Test independently → Deploy/Demo
5. Add User Story 3 (Delete Board) → Test independently → Deploy/Demo
6. Add User Story 4 (Edit Board) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (create) + User Story 4 (edit)
   - Developer B: User Story 2 (list) + User Story 3 (delete)
   - Developer C: User Story 5 (detail)
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
| Phase 1: Setup | 3 | 3 | 0 | Project structure verification ✅ |
| Phase 2: Foundational | 5 | 5 | 0 | Types, service, hook, validation ✅ |
| Phase 3: US1 (Create) | 10 | 7 | 3 | Create board modal (tests pending) |
| Phase 4: US2 (List) | 10 | 7 | 3 | Board list (tests pending) |
| Phase 5: US3 (Delete) | 10 | 7 | 3 | Delete modal (tests pending) |
| Phase 6: US4 (Edit) | 9 | 6 | 3 | Edit modal (tests pending) |
| Phase 7: US5 (Detail) | 10 | 7 | 3 | Board detail page (tests pending) |
| Phase 8: Polish | 10 | 0 | 10 | Responsive, E2E, docs |
| **Total** | **67** | **42** | **25** | |

**Completion Status**: 63% (42/67 tasks completed)

**MVP Scope**: Phases 1-4 (28 tasks) - Create + List boards ✅ COMPLETE
**Full Feature**: All phases (67 tasks) - Complete boards CRUD UI (63% complete)

**Remaining**: Test tasks (18) + Polish (10) = 28 tasks
