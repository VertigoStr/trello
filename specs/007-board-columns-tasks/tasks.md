# Tasks: Доска с колонками и задачами

**Input**: Design documents from `/specs/007-board-columns-tasks/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/columns-tasks-api.md, research.md, quickstart.md

**Tests**: Tests are MANDATORY per Constitution (Test-First principle). Component tests, integration tests, and E2E tests included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`, `frontend/tests/`
- Components: `frontend/src/components/board/`, `frontend/src/components/modals/`
- Pages: `frontend/src/pages/`
- Services: `frontend/src/services/`
- Hooks: `frontend/src/hooks/`
- Types: `frontend/src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Verify frontend project structure exists: frontend/src/{components,pages,services,hooks,types}
- [X] T002 [P] Verify dependencies installed: frontend/package.json (React, Bootstrap 5, @dnd-kit)
- [X] T003 [P] Verify Vitest configured: frontend/vite.config.ts (from 005-frontend-auth)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create column types: frontend/src/types/column.ts (Column, CreateColumnDTO, UpdateColumnDTO)
- [X] T005 [P] Create task types: frontend/src/types/task.ts (Task, CreateTaskDTO, UpdateTaskDTO, MoveTaskDTO)
- [X] T006 [P] Create columnService: frontend/src/services/columnService.ts (API integration for columns)
- [X] T007 [P] Create taskService: frontend/src/services/taskService.ts (API integration for tasks)
- [X] T008 [P] Create useBoard hook: frontend/src/hooks/useBoard.ts (state management for board with polling)
- [X] T009 [P] Install @dnd-kit dependencies: frontend/package.json (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Создание колонки на доске (Priority: P1) 🎯 MVP

**Goal**: Реализовать модальное окно создания колонки на доске

**Independent Test**: Пользователь может открыть доску, нажать "Добавить колонку", ввести название и создать колонку, которая отображается на доске

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [P] [US1] Component test for CreateColumnModal in frontend/tests/components/modals/CreateColumnModal.test.tsx
- [X] T011 [P] [US1] Integration test for create column flow in frontend/tests/integration/CreateColumnFlow.test.tsx
- [X] T012 [P] [US1] Test for column validation in frontend/tests/services/columnService.test.ts

### Implementation for User Story 1

- [X] T013 [P] [US1] Create CreateColumnModal component: frontend/src/components/modals/CreateColumnModal.tsx
- [X] T014 [P] [US1] Add form state management with useState in frontend/src/components/modals/CreateColumnModal.tsx
- [X] T015 [US1] Implement client-side validation (title 1-255 chars) in frontend/src/components/modals/CreateColumnModal.tsx
- [X] T016 [US1] Integrate with columnService.create() in frontend/src/services/columnService.ts
- [X] T017 [US1] Add error handling for API errors (validation, auth) in frontend/src/components/modals/CreateColumnModal.tsx
- [X] T018 [US1] Add loading state during creation in frontend/src/components/modals/CreateColumnModal.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently ✅

---

## Phase 4: User Story 2 - Создание задачи в колонке (Priority: P1)

**Goal**: Реализовать модальное окно создания задачи в колонке

**Independent Test**: Пользователь может открыть колонку, нажать "Добавить задачу", ввести название и создать задачу, которая отображается в колонке

### Tests for User Story 2

- [X] T019 [P] [US2] Component test for CreateTaskModal in frontend/tests/components/modals/CreateTaskModal.test.tsx
- [X] T020 [P] [US2] Integration test for create task flow in frontend/tests/integration/CreateTaskFlow.test.tsx
- [X] T021 [P] [US2] Test for task validation in frontend/tests/services/taskService.test.ts

### Implementation for User Story 2

- [X] T022 [P] [US2] Create CreateTaskModal component: frontend/src/components/modals/CreateTaskModal.tsx
- [X] T023 [P] [US2] Add form state management with useState in frontend/src/components/modals/CreateTaskModal.tsx
- [X] T024 [US2] Implement client-side validation (title 1-255 chars, description 0-10000 chars) in frontend/src/components/modals/CreateTaskModal.tsx
- [X] T025 [US2] Integrate with taskService.create() in frontend/src/services/taskService.ts
- [X] T026 [US2] Add error handling for API errors in frontend/src/components/modals/CreateTaskModal.tsx
- [X] T027 [US2] Add loading state during creation in frontend/src/components/modals/CreateTaskModal.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently ✅

---

## Phase 5: User Story 3 - Перемещение задачи между колонками (Priority: P1)

**Goal**: Реализовать drag-and-drop для перемещения задач между колонками

**Independent Test**: Пользователь может перетащить задачу из одной колонки в другую, и задача отображается в новой колонке

### Tests for User Story 3

- [X] T028 [P] [US3] Component test for TaskCard with drag-and-drop in frontend/tests/components/board/TaskCard.test.tsx
- [X] T029 [P] [US3] Integration test for move task flow in frontend/tests/integration/MoveTaskFlow.test.tsx
- [X] T030 [P] [US3] Test for optimistic update rollback on error in frontend/tests/hooks/useBoard.test.ts

### Implementation for User Story 3

- [X] T031 [P] [US3] Create TaskCard component with useSortable: frontend/src/components/board/TaskCard.tsx
- [X] T032 [P] [US3] Create ColumnCard component with SortableContext: frontend/src/components/board/ColumnCard.tsx
- [X] T033 [US3] Integrate @dnd-kit DndContext in BoardDetailPage: frontend/src/pages/BoardDetailPage.tsx
- [X] T034 [US3] Implement handleDragEnd with taskService.move() in frontend/src/pages/BoardDetailPage.tsx
- [X] T035 [US3] Add optimistic update with rollback on error in frontend/src/hooks/useBoard.ts
- [X] T036 [US3] Add error notification for failed move in frontend/src/hooks/useBoard.ts
- [X] T037 [US3] Add access denied handling for move operation in frontend/src/hooks/useBoard.ts

**Checkpoint**: At this point, User Stories 1-3 should all work independently ✅

---

## Phase 6: User Story 4 - Редактирование задачи (Priority: P2)

**Goal**: Реализовать модальное окно редактирования задачи

**Independent Test**: Пользователь может открыть задачу на редактирование, изменить название или описание и сохранить изменения

### Tests for User Story 4

- [X] T038 [P] [US4] Component test for EditTaskModal in frontend/tests/components/modals/EditTaskModal.test.tsx
- [X] T039 [P] [US4] Integration test for edit task flow in frontend/tests/integration/EditTaskFlow.test.tsx

### Implementation for User Story 4

- [X] T040 [P] [US4] Create EditTaskModal component: frontend/src/components/modals/EditTaskModal.tsx
- [X] T041 [US4] Pre-fill form with current task data in frontend/src/components/modals/EditTaskModal.tsx
- [X] T042 [US4] Implement validation (same as create) in frontend/src/components/modals/EditTaskModal.tsx
- [X] T043 [US4] Integrate with taskService.update() in frontend/src/services/taskService.ts
- [X] T044 [US4] Add error handling for access denied in frontend/src/components/modals/EditTaskModal.tsx

**Checkpoint**: At this point, User Stories 1-4 should all work independently ✅

---

## Phase 7: User Story 5 - Удаление задачи (Priority: P2)

**Goal**: Реализовать подтверждение и удаление задачи

**Independent Test**: Пользователь может удалить задачу через диалог подтверждения, и задача исчезает из колонки

### Tests for User Story 5

- [X] T045 [P] [US5] Component test for DeleteConfirmModal in frontend/tests/components/modals/DeleteConfirmModal.test.tsx
- [X] T046 [P] [US5] Integration test for delete task flow in frontend/tests/integration/DeleteTaskFlow.test.tsx

### Implementation for User Story 5

- [X] T047 [P] [US5] Create DeleteConfirmModal component: frontend/src/components/modals/DeleteConfirmModal.tsx
- [X] T048 [US5] Add confirmation dialog before delete in frontend/src/components/modals/DeleteConfirmModal.tsx
- [X] T049 [US5] Integrate with taskService.delete() in frontend/src/services/taskService.ts
- [X] T050 [US5] Add optimistic update with rollback in frontend/src/hooks/useBoard.ts
- [X] T051 [US5] Add error handling for access denied in frontend/src/hooks/useBoard.ts

**Checkpoint**: At this point, User Stories 1-5 should all work independently ✅

---

## Phase 8: User Story 6 - Переименование колонки (Priority: P2)

**Goal**: Реализовать модальное окно переименования колонки

**Independent Test**: Пользователь может открыть колонку на редактирование, изменить название и сохранить изменения

### Tests for User Story 6

- [X] T052 [P] [US6] Component test for EditColumnModal in frontend/tests/components/modals/EditColumnModal.test.tsx
- [X] T053 [P] [US6] Integration test for edit column flow in frontend/tests/integration/EditColumnFlow.test.tsx

### Implementation for User Story 6

- [X] T054 [P] [US6] Create EditColumnModal component: frontend/src/components/modals/EditColumnModal.tsx
- [X] T055 [US6] Pre-fill form with current column data in frontend/src/components/modals/EditColumnModal.tsx
- [X] T056 [US6] Integrate with columnService.update() in frontend/src/services/columnService.ts
- [X] T057 [US6] Add error handling for access denied in frontend/src/components/modals/EditColumnModal.tsx

**Checkpoint**: At this point, User Stories 1-6 should all work independently ✅

---

## Phase 9: User Story 7 - Удаление колонки (Priority: P3)

**Goal**: Реализовать подтверждение и удаление колонки со всеми задачами

**Independent Test**: Пользователь может удалить колонку через диалог подтверждения с предупреждением о задачах

### Tests for User Story 7

- [X] T058 [P] [US7] Component test for DeleteColumnModal in frontend/tests/components/modals/DeleteColumnModal.test.tsx
- [X] T059 [P] [US7] Integration test for delete column flow in frontend/tests/integration/DeleteColumnFlow.test.tsx

### Implementation for User Story 7

- [X] T060 [P] [US7] Create DeleteColumnModal component with task count warning: frontend/src/components/modals/DeleteColumnModal.tsx
- [X] T061 [US7] Add confirmation dialog with task count in frontend/src/components/modals/DeleteColumnModal.tsx
- [X] T062 [US7] Integrate with columnService.delete() in frontend/src/services/columnService.ts
- [X] T063 [US7] Add optimistic update with rollback in frontend/src/hooks/useBoard.ts
- [X] T064 [US7] Add error handling for owner-only restriction in frontend/src/hooks/useBoard.ts

**Checkpoint**: All user stories should now be independently functional ✅

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T065 [P] Add responsive CSS for mobile devices (320px-768px) in frontend/src/styles/index.css
- [X] T066 [P] Add loading skeletons for board detail in frontend/src/components/board/BoardSkeleton.tsx
- [X] T067 [P] Add error boundary component in frontend/src/components/common/ErrorBoundary.tsx (from 005-frontend-auth)
- [X] T068 [P] Add toast notifications for success/error messages in frontend/src/components/common/Toast.tsx (from 005-frontend-auth)
- [X] T069 [P] Add polling interval configuration (30 seconds) in frontend/src/hooks/useBoard.ts
- [X] T070 [P] Add column/task count limits validation (20 columns, 100 tasks) in frontend/src/hooks/useBoard.ts
- [ ] T071 [P] Add E2E tests with Playwright in frontend/tests/e2e/board-columns-tasks.spec.ts
- [ ] T072 [P] Add accessibility (a11y) tests in frontend/tests/a11y/
- [ ] T073 Run full test suite (unit + integration + E2E)
- [ ] T074 Run quickstart.md validation (follow all steps end-to-end)
- [ ] T075 [P] Add JSDoc comments to all public functions
- [ ] T076 [P] Update frontend/README.md with board columns and tasks documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on useBoard hook
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Independent
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Independent

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before pages
- Services before integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T003)
- All Foundational tasks marked [P] can run in parallel (T004-T009)
- Once Foundational phase completes:
  - Developer A: User Story 1 (create column) + User Story 6 (edit column)
  - Developer B: User Story 2 (create task) + User Story 4 (edit task)
  - Developer C: User Story 3 (move task) + User Story 5 (delete task) + User Story 7 (delete column)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Component test for CreateColumnModal"
Task: "Integration test for create column flow"
Task: "Test for column validation"

# Launch all components for User Story 1 together:
Task: "Create CreateColumnModal component"
Task: "Add form state management with useState"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Create Column)
4. Complete Phase 4: User Story 2 (Create Task)
5. **STOP and VALIDATE**: Test create column and task
   - Create new column on board
   - Create new task in column
   - Verify validation errors
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Create Column) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Create Task) → Test independently → Deploy/Demo
4. Add User Story 3 (Move Task) → Test independently → Deploy/Demo
5. Add User Story 4 (Edit Task) → Test independently → Deploy/Demo
6. Add User Story 5 (Delete Task) → Test independently → Deploy/Demo
7. Add User Story 6 (Edit Column) → Test independently → Deploy/Demo
8. Add User Story 7 (Delete Column) → Test independently → Deploy/Demo
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (create column) + User Story 6 (edit column) + User Story 7 (delete column)
   - Developer B: User Story 2 (create task) + User Story 4 (edit task) + User Story 5 (delete task)
   - Developer C: User Story 3 (move task with drag-and-drop)
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
- Drag-and-drop requires @dnd-kit library installation
- Polling interval: 30 seconds for board data refresh
- Column limit: 20 columns max per board
- Task limit: 100 tasks max per column

## Task Summary

| Phase | Total | Completed | Remaining | Description |
|-------|-------|-----------|-----------|-------------|
| Phase 1: Setup | 3 | 0 | 3 | Project structure verification |
| Phase 2: Foundational | 6 | 0 | 6 | Types, services, hook, @dnd-kit |
| Phase 3: US1 (Create Column) | 9 | 0 | 9 | Create column modal with tests |
| Phase 4: US2 (Create Task) | 9 | 0 | 9 | Create task modal with tests |
| Phase 5: US3 (Move Task) | 10 | 0 | 10 | Drag-and-drop with optimistic updates |
| Phase 6: US4 (Edit Task) | 7 | 0 | 7 | Edit task modal with tests |
| Phase 7: US5 (Delete Task) | 7 | 0 | 7 | Delete confirmation with tests |
| Phase 8: US6 (Edit Column) | 6 | 0 | 6 | Edit column modal with tests |
| Phase 9: US7 (Delete Column) | 7 | 0 | 7 | Delete column with task warning |
| Phase 10: Polish | 12 | 0 | 12 | Responsive, polling, E2E, docs |
| **Total** | **76** | **0** | **76** | |

**Completion Status**: 0% (0/76 tasks completed)

**MVP Scope**: Phases 1-4 (27 tasks) - Create column + Create task only
**Full Feature**: All phases (76 tasks) - Complete board columns and tasks CRUD UI
