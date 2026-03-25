# Tasks: Создание задач и привязка к доскам

**Input**: Design documents from `/specs/004-create-tasks-boards/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/tasks-api.md, research.md, quickstart.md

**Tests**: Tests are MANDATORY per Constitution (Test-First principle). Contract tests and integration tests included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/src/`, `backend/tests/`
- Models: `backend/src/models/`
- Services: `backend/src/services/`
- API: `backend/src/api/routes/`, `backend/src/api/schemas/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Verify project structure exists: backend/src/
- [ ] T002 [P] Verify dependencies in backend/requirements.txt (FastAPI, SQLAlchemy, asyncpg)
- [ ] T003 [P] Verify pytest configuration in backend/pytest.ini

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Verify Task model exists in backend/src/models/task.py with all fields from data-model.md
- [ ] T005 [P] Verify Column model exists in backend/src/models/column.py (from 003-task-boards-crud)
- [ ] T006 [P] Verify Board model exists in backend/src/models/board.py (from 003-task-boards-crud)
- [ ] T007 [P] Verify BoardMember model exists in backend/src/models/board_member.py (from 003-task-boards-crud)
- [ ] T008 [P] Verify models __init__.py exports all models in backend/src/models/__init__.py
- [ ] T009 [P] Add version field to Task model for optimistic locking in backend/src/models/task.py
- [ ] T010 [P] Create database migration for adding version column to tasks table in backend/src/db/migrations/007_add_task_version.py
- [ ] T011 [P] Verify PermissionService exists in backend/src/services/permission_service.py (from 003-task-boards-crud)
- [ ] T012 [P] Verify JWT authentication middleware exists in backend/src/middleware/auth_middleware.py (from 003-task-boards-crud)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Создание задачи в колонке доски (Priority: P1) 🎯 MVP

**Goal**: Реализовать API создания новой задачи в колонке доски с назначением исполнителя

**Independent Test**: Пользователь может создать задачу с названием в существующей колонке и увидеть её в списке задач колонки

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Create contract test for POST /api/boards/{board_id}/columns/{column_id}/tasks in backend/tests/contract/test_tasks_crud.py
- [ ] T014 [P] [US1] Create integration test for task creation flow in backend/tests/integration/test_task_flows.py
- [ ] T015 [P] [US1] Create validation test for task title in backend/tests/unit/test_task_service.py

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create TaskCreate schema in backend/src/api/schemas/task.py with Pydantic validation
- [ ] T017 [P] [US1] Create TaskResponse schema in backend/src/api/schemas/task.py
- [ ] T018 [P] [US1] Implement create_task method in backend/src/services/task_service.py
- [ ] T019 [US1] Create task creation endpoint POST /api/boards/{board_id}/columns/{column_id}/tasks in backend/src/api/routes/tasks.py
- [ ] T020 [US1] Add title validation (1-255 chars) in backend/src/api/schemas/task.py
- [ ] T021 [US1] Add assignee selection from board members in backend/src/services/task_service.py
- [ ] T022 [US1] Add default assignee (creator) logic in backend/src/services/task_service.py
- [ ] T023 [US1] Add position management (append to end of column) in backend/src/services/task_service.py
- [ ] T024 [US1] Add error handling for validation errors in backend/src/api/routes/tasks.py with 400 response
- [ ] T025 [US1] Add structured logging for task creation in backend/src/services/task_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Просмотр задач в колонках доски (Priority: P1)

**Goal**: Реализовать API получения списка всех задач доски с группировкой по колонкам

**Independent Test**: Пользователь открывает доску и видит все задачи, сгруппированные по колонкам с правильным порядком

### Tests for User Story 2

- [ ] T026 [P] [US2] Create contract test for GET /api/boards/{board_id}/tasks in backend/tests/contract/test_tasks_crud.py
- [ ] T027 [P] [US2] Create integration test for tasks list with pagination in backend/tests/integration/test_task_flows.py
- [ ] T028 [P] [US2] Create test for tasks filtering by column in backend/tests/unit/test_task_service.py

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create TaskListResponse schema with pagination in backend/src/api/schemas/task.py
- [ ] T030 [P] [US2] Implement list_tasks method in backend/src/services/task_service.py with pagination
- [ ] T031 [US2] Create tasks list endpoint GET /api/boards/{board_id}/tasks in backend/src/api/routes/tasks.py
- [ ] T032 [US2] Add query parameters handling (page, limit, column_id, assignee_id) in backend/src/api/routes/tasks.py
- [ ] T033 [US2] Implement tasks grouping by column in backend/src/services/task_service.py
- [ ] T034 [US2] Add position-based sorting in backend/src/services/task_service.py
- [ ] T035 [US2] Add pagination metadata to response in backend/src/api/routes/tasks.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Редактирование задачи (Priority: P2)

**Goal**: Реализовать API редактирования задачи с поддержкой optimistic locking

**Independent Test**: Пользователь может изменить название существующей задачи и увидеть изменения

### Tests for User Story 3

- [ ] T036 [P] [US3] Create contract test for PUT /api/tasks/{task_id} in backend/tests/contract/test_tasks_crud.py
- [ ] T037 [P] [US3] Create integration test for task update flow in backend/tests/integration/test_task_flows.py
- [ ] T038 [P] [US3] Create test for optimistic locking conflict in backend/tests/unit/test_task_service.py
- [ ] T039 [P] [US3] Create test for assignee edit permission in backend/tests/unit/test_permission_service.py

### Implementation for User Story 3

- [ ] T040 [P] [US3] Create TaskUpdate schema in backend/src/api/schemas/task.py
- [ ] T041 [P] [US3] Implement update_task method in backend/src/services/task_service.py with version check
- [ ] T042 [US3] Create task update endpoint PUT /api/tasks/{task_id} in backend/src/api/routes/tasks.py
- [ ] T043 [US3] Add ETag header support in backend/src/api/routes/tasks.py
- [ ] T044 [US3] Add If-Match header validation in backend/src/api/routes/tasks.py
- [ ] T045 [US3] Implement optimistic locking with version increment in backend/src/services/task_service.py
- [ ] T046 [US3] Add 412 Conflict response for version mismatch in backend/src/api/routes/tasks.py
- [ ] T047 [US3] Add assignee permission check (assignee can edit regardless of board role) in backend/src/services/permission_service.py
- [ ] T048 [US3] Add updated_at timestamp update in backend/src/services/task_service.py

**Checkpoint**: At this point, User Stories 1-3 should all work independently

---

## Phase 6: User Story 4 - Перемещение задачи между колонками (Priority: P2)

**Goal**: Реализовать API перемещения задачи между колонками с указанием позиции

**Independent Test**: Пользователь может переместить задачу из одной колонки в другую

### Tests for User Story 4

- [ ] T049 [P] [US4] Create contract test for POST /api/tasks/{task_id}/move in backend/tests/contract/test_tasks_crud.py
- [ ] T050 [P] [US4] Create integration test for task move flow in backend/tests/integration/test_task_flows.py
- [ ] T051 [P] [US4] Create test for position calculation in backend/tests/unit/test_task_service.py

### Implementation for User Story 4

- [ ] T052 [P] [US4] Create TaskMoveRequest schema in backend/src/api/schemas/task.py
- [ ] T053 [P] [US4] Implement move_task method in backend/src/services/task_service.py
- [ ] T054 [US4] Create task move endpoint POST /api/tasks/{task_id}/move in backend/src/api/routes/tasks.py
- [ ] T055 [US4] Add column_id and position parameters in backend/src/api/schemas/task.py
- [ ] T056 [US4] Implement position calculation (float-based) in backend/src/services/task_service.py
- [ ] T057 [US4] Add default position (end of column) logic in backend/src/services/task_service.py
- [ ] T058 [US4] Add write permission check for move operation in backend/src/services/permission_service.py
- [ ] T059 [US4] Add version increment for move operation in backend/src/services/task_service.py

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Удаление задачи (Priority: P3)

**Goal**: Реализовать API удаления задачи (soft delete)

**Independent Test**: Пользователь может удалить задачу, и она исчезает из колонки

### Tests for User Story 5

- [ ] T060 [P] [US5] Create contract test for DELETE /api/tasks/{task_id} in backend/tests/contract/test_tasks_crud.py
- [ ] T061 [P] [US5] Create integration test for task delete flow in backend/tests/integration/test_task_flows.py
- [ ] T062 [P] [US5] Create test for soft delete flag in backend/tests/unit/test_task_service.py

### Implementation for User Story 5

- [ ] T063 [P] [US5] Implement delete_task method in backend/src/services/task_service.py with soft delete
- [ ] T064 [US5] Create task delete endpoint DELETE /api/tasks/{task_id} in backend/src/api/routes/tasks.py
- [ ] T065 [US5] Add 204 No Content response for successful delete in backend/src/api/routes/tasks.py
- [ ] T066 [US5] Add delete permission check in backend/src/services/permission_service.py
- [ ] T067 [US5] Add is_deleted flag update in backend/src/services/task_service.py
- [ ] T068 [US5] Add filter for is_deleted in list_tasks method in backend/src/services/task_service.py

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Снятие исполнителя с задачи (Priority: P3)

**Goal**: Реализовать API снятия исполнителя с задачи (для самого исполнителя)

**Independent Test**: Исполнитель может снять с себя задачу независимо от роли на доске

### Tests for User Story 6

- [ ] T069 [P] [US6] Create contract test for POST /api/tasks/{task_id}/unassign in backend/tests/contract/test_tasks_crud.py
- [ ] T070 [P] [US6] Create integration test for unassign flow in backend/tests/integration/test_task_flows.py

### Implementation for User Story 6

- [ ] T071 [US6] Create unassign_task method in backend/src/services/task_service.py
- [ ] T072 [US6] Create unassign endpoint POST /api/tasks/{task_id}/unassign in backend/src/api/routes/tasks.py
- [ ] T073 [US6] Add assignee-only permission check in backend/src/services/permission_service.py
- [ ] T074 [US6] Add assignee_id = NULL update in backend/src/services/task_service.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T075 [P] Add ETag header to GET /api/tasks/{task_id} response in backend/src/api/routes/tasks.py
- [ ] T076 [P] Add If-None-Match support for 304 Not Modified in backend/src/api/routes/tasks.py
- [ ] T077 [P] Create database index for tasks.version in backend/src/db/migrations/008_add_task_version_index.py
- [ ] T078 [P] Add renumbering utility for position rebalancing in backend/src/services/task_service.py
- [ ] T079 [P] Update API documentation in backend/README.md with tasks API examples
- [ ] T080 [P] Add rate limiting for tasks endpoints in backend/src/middleware/rate_limiter.py
- [ ] T081 [P] Add performance monitoring for task operations in backend/src/utils/monitoring.py
- [ ] T082 Run full integration test suite
- [ ] T083 Run quickstart.md validation (follow all steps end-to-end)
- [ ] T084 [P] Add type hints to all service methods
- [ ] T085 [P] Add docstrings to all public methods

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on Task model
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on Task model, PermissionService
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on Task, Column models
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Depends on Task model (soft delete)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Depends on Task model (assignee field)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/Schemas before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T003)
- All Foundational tasks marked [P] can run in parallel (T004-T012)
- Once Foundational phase completes:
  - Developer A: User Story 1 (task creation) + User Story 5 (delete)
  - Developer B: User Story 2 (list tasks) + User Story 6 (unassign)
  - Developer C: User Story 3 (update) + User Story 4 (move)
- All tests for a user story marked [P] can run in parallel
- Models/Schemas within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create contract test for POST /api/boards/{board_id}/columns/{column_id}/tasks"
Task: "Create integration test for task creation flow"
Task: "Create validation test for task title"

# Launch all schemas for User Story 1 together:
Task: "Create TaskCreate schema in backend/src/api/schemas/task.py"
Task: "Create TaskResponse schema in backend/src/api/schemas/task.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Create Task)
4. **STOP and VALIDATE**: Test task creation
   - Create task via POST endpoint
   - Verify task created in database
   - Verify assignee assigned (default or selected)
   - Verify validation errors for invalid input
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Create Task) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (List Tasks) → Test independently → Deploy/Demo
4. Add User Story 3 (Update Task) → Test independently → Deploy/Demo
5. Add User Story 4 (Move Task) → Test independently → Deploy/Demo
6. Add User Story 5 (Delete Task) → Test independently → Deploy/Demo
7. Add User Story 6 (Unassign) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (create) + User Story 5 (delete)
   - Developer B: User Story 2 (list) + User Story 6 (unassign)
   - Developer C: User Story 3 (update) + User Story 4 (move)
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
| Phase 1: Setup | 3 | 0 | 3 | Project structure verification |
| Phase 2: Foundational | 9 | 0 | 9 | Models, migrations, permissions, auth |
| Phase 3: US1 (Create) | 13 | 0 | 13 | Task creation with tests |
| Phase 4: US2 (List) | 10 | 0 | 10 | Tasks list with pagination |
| Phase 5: US3 (Update) | 14 | 0 | 14 | Task update with optimistic locking |
| Phase 6: US4 (Move) | 11 | 0 | 11 | Task move between columns |
| Phase 7: US5 (Delete) | 9 | 0 | 9 | Soft delete with tests |
| Phase 8: US6 (Unassign) | 6 | 0 | 6 | Unassign self from task |
| Phase 9: Polish | 11 | 0 | 11 | Cross-cutting concerns |
| **Total** | **86** | **0** | **86** | |

**Completion Status**: 0% (0/86 tasks completed)

**MVP Scope**: Phases 1-3 (25 tasks) - Task creation only
**Full Feature**: All phases (86 tasks) - Complete tasks CRUD with unassign
