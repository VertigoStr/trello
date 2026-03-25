# Tasks: Task Boards CRUD API

**Input**: Design documents from `/specs/003-task-boards-crud/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/boards-api.md, research.md, quickstart.md

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

- [X] T001 [P] Create models directory structure: backend/src/models/
- [X] T002 [P] Create services directory structure: backend/src/services/
- [X] T003 [P] Create API routes directory: backend/src/api/routes/
- [X] T004 [P] Create API schemas directory: backend/src/api/schemas/
- [X] T005 [P] Create tests directory structure: backend/tests/{contract,integration,unit}/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create Board model in backend/src/models/board.py with all fields from data-model.md
- [X] T007 [P] Create BoardMember model in backend/src/models/board_member.py
- [X] T008 [P] Create Column model in backend/src/models/column.py
- [X] T009 [P] Create Task model in backend/src/models/task.py
- [X] T010 [P] Update models __init__.py to export all models in backend/src/models/__init__.py
- [X] T011 [P] Create database migrations for boards table in backend/src/db/migrations/003_create_boards.py
- [X] T012 [P] Create database migrations for board_members table in backend/src/db/migrations/004_create_board_members.py
- [X] T013 [P] Create database migrations for columns table in backend/src/db/migrations/005_create_columns.py
- [X] T014 [P] Create database migrations for tasks table in backend/src/db/migrations/006_create_tasks.py
- [X] T015 [P] Create permission service in backend/src/services/permission_service.py with role-based checks
- [X] T016 [P] Create JWT authentication dependency in backend/src/middleware/auth_middleware.py (integrate with 002-auth-api)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Создание доски задач (Priority: P1) 🎯 MVP

**Goal**: Реализовать API создания новой доски с назначением владельца

**Independent Test**: Пользователь может создать доску с названием и описанием, автоматически становится владельцем

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T017 [P] [US1] Create contract test for POST /api/boards in backend/tests/contract/test_boards_crud.py
- [X] T018 [P] [US1] Create integration test for board creation flow in backend/tests/integration/test_board_flows.py
- [X] T019 [P] [US1] Create validation test for board title in backend/tests/unit/test_board_service.py

### Implementation for User Story 1

- [X] T020 [P] [US1] Create Board schema in backend/src/api/schemas/board.py with Pydantic validation
- [X] T021 [P] [US1] Create board service in backend/src/services/board_service.py with create_board method
- [X] T022 [US1] Create board creation endpoint POST /api/boards in backend/src/api/routes/boards.py
- [X] T023 [US1] Add title validation (1-255 chars) in backend/src/api/schemas/board.py
- [X] T024 [US1] Add owner assignment logic in backend/src/services/board_service.py
- [X] T025 [US1] Add error handling for validation errors in backend/src/api/routes/boards.py with 400 response
- [X] T026 [US1] Add structured logging for board creation in backend/src/services/board_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Просмотр списка досок (Priority: P1)

**Goal**: Реализовать API получения списка всех досок пользователя с пагинацией

**Independent Test**: Пользователь видит список досок, где он является владельцем или участником

### Tests for User Story 2

- [X] T027 [P] [US2] Create contract test for GET /api/boards in backend/tests/contract/test_boards_crud.py
- [X] T028 [P] [US2] Create integration test for boards list with pagination in backend/tests/integration/test_board_flows.py
- [X] T029 [P] [US2] Create test for boards filtering by status in backend/tests/unit/test_board_service.py

### Implementation for User Story 2

- [X] T030 [P] [US2] Create pagination schema in backend/src/api/schemas/board.py
- [X] T031 [P] [US2] Implement list_boards method in backend/src/services/board_service.py with pagination
- [X] T032 [US2] Create boards list endpoint GET /api/boards in backend/src/api/routes/boards.py
- [X] T033 [US2] Add query parameters handling (page, limit, status) in backend/src/api/routes/boards.py
- [X] T034 [US2] Implement boards filtering by user access (owner or member) in backend/src/services/board_service.py
- [X] T035 [US2] Add pagination metadata to response in backend/src/api/routes/boards.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Просмотр отдельной доски (Priority: P1)

**Goal**: Реализовать API получения детальной информации о доске с колонками и задачами

**Independent Test**: Пользователь может открыть доску по ID и видеть её содержимое (колонки, задачи)

### Tests for User Story 3

- [X] T036 [P] [US3] Create contract test for GET /api/boards/{id} in backend/tests/contract/test_boards_crud.py
- [X] T037 [P] [US3] Create integration test for board details with columns in backend/tests/integration/test_board_flows.py
- [X] T038 [P] [US3] Create test for access denied scenario in backend/tests/unit/test_permission_service.py

### Implementation for User Story 3

- [X] T039 [P] [US3] Create Column schema in backend/src/api/schemas/column.py
- [X] T040 [P] [US3] Create Task schema in backend/src/api/schemas/task.py
- [X] T041 [P] [US3] Implement get_board_details method in backend/src/services/board_service.py with columns and tasks
- [X] T042 [US3] Create board details endpoint GET /api/boards/{id} in backend/src/api/routes/boards.py
- [X] T043 [US3] Add permission check for board access in backend/src/services/permission_service.py
- [X] T044 [US3] Add 403 response for access denied in backend/src/api/routes/boards.py
- [X] T045 [US3] Add 404 response for board not found in backend/src/api/routes/boards.py
- [X] T046 [US3] Implement nested loading of columns and tasks in backend/src/services/board_service.py

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Редактирование доски (Priority: P2)

**Goal**: Реализовать API редактирования настроек доски (название, описание)

**Independent Test**: Владелец доски может изменить название и описание доски

### Tests for User Story 4

- [X] T047 [P] [US4] Create contract test for PUT /api/boards/{id} in backend/tests/contract/test_boards_crud.py
- [X] T048 [P] [US4] Create integration test for board update flow in backend/tests/integration/test_board_flows.py
- [X] T049 [P] [US4] Create test for non-owner update attempt in backend/tests/unit/test_permission_service.py

### Implementation for User Story 4

- [X] T050 [P] [US4] Create board update schema in backend/src/api/schemas/board.py
- [X] T051 [P] [US4] Implement update_board method in backend/src/services/board_service.py
- [X] T052 [US4] Create board update endpoint PUT /api/boards/{id} in backend/src/api/routes/boards.py
- [X] T053 [US4] Add owner-only permission check in backend/src/services/permission_service.py
- [X] T054 [US4] Add 403 response for non-owner in backend/src/api/routes/boards.py
- [X] T055 [US4] Add validation for updated fields in backend/src/api/schemas/board.py
- [X] T056 [US4] Add updated_at timestamp update in backend/src/services/board_service.py

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Удаление доски (Priority: P2)

**Goal**: Реализовать API удаления доски со всеми связанными данными

**Independent Test**: Владелец может удалить доску, все связанные данные удаляются каскадом

### Tests for User Story 5

- [X] T057 [P] [US5] Create contract test for DELETE /api/boards/{id} in backend/tests/contract/test_boards_crud.py
- [X] T058 [P] [US5] Create integration test for cascade delete in backend/tests/integration/test_board_flows.py
- [X] T059 [P] [US5] Create test for non-owner delete attempt in backend/tests/unit/test_permission_service.py

### Implementation for User Story 5

- [X] T060 [P] [US5] Implement delete_board method in backend/src/services/board_service.py with cascade delete
- [X] T061 [US5] Create board delete endpoint DELETE /api/boards/{id} in backend/src/api/routes/boards.py
- [X] T062 [US5] Add owner-only permission check for delete in backend/src/services/permission_service.py
- [X] T063 [US5] Add 204 No Content response for successful delete in backend/src/api/routes/boards.py
- [X] T064 [US5] Add cascade delete configuration in models (relationships) in backend/src/models/board.py
- [X] T065 [US5] Add structured logging for board deletion in backend/src/services/board_service.py

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Управление участниками доски (Priority: P3)

**Goal**: Реализовать API добавления, удаления и изменения ролей участников доски

**Independent Test**: Владелец может добавить/удалить участника и назначить права (read/write/delete)

### Tests for User Story 6

- [X] T066 [P] [US6] Create contract test for POST /api/boards/{id}/members in backend/tests/contract/test_board_members.py
- [X] T067 [P] [US6] Create contract test for DELETE /api/boards/{id}/members/{user_id} in backend/tests/contract/test_board_members.py
- [X] T068 [P] [US6] Create contract test for PUT /api/boards/{id}/members/{user_id}/role in backend/tests/contract/test_board_members.py
- [X] T069 [P] [US6] Create integration test for member management flow in backend/tests/integration/test_board_flows.py

### Implementation for User Story 6

- [X] T070 [P] [US6] Create BoardMember schema in backend/src/api/schemas/board_member.py
- [X] T071 [P] [US6] Create board member service in backend/src/services/board_member_service.py
- [X] T072 [P] [US6] Implement add_member method in backend/src/services/board_member_service.py
- [X] T073 [P] [US6] Implement remove_member method in backend/src/services/board_member_service.py
- [X] T074 [P] [US6] Implement update_member_role method in backend/src/services/board_member_service.py
- [X] T075 [US6] Create add member endpoint POST /api/boards/{id}/members in backend/src/api/routes/board_members.py
- [X] T076 [US6] Create remove member endpoint DELETE /api/boards/{id}/members/{user_id} in backend/src/api/routes/board_members.py
- [X] T077 [US6] Create update role endpoint PUT /api/boards/{id}/members/{user_id}/role in backend/src/api/routes/board_members.py
- [X] T078 [US6] Add owner-only permission check for member management in backend/src/services/permission_service.py
- [X] T079 [US6] Add user lookup by email in backend/src/services/board_member_service.py
- [X] T080 [US6] Add 404 response for user not found in backend/src/api/routes/board_members.py
- [X] T081 [US6] Add permissions validation in backend/src/api/schemas/board_member.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T082 [P] Create health check endpoint for boards API GET /health/boards in backend/src/api/routes/health.py
- [X] T083 [P] Add CORS middleware for boards endpoints in backend/src/middleware/cors.py
- [X] T084 [P] Add request ID middleware for tracing in backend/src/middleware/request_id.py
- [X] T085 [P] Create API documentation in backend/README.md with usage examples
- [X] T086 [P] Add rate limiting for boards endpoints in backend/src/middleware/rate_limiter.py
- [X] T087 [P] Create database cleanup script for soft-deleted tasks in backend/src/scripts/cleanup_tasks.py
- [X] T088 [P] Add performance monitoring for board operations in backend/src/utils/monitoring.py
- [X] T089 Run full integration test suite
- [X] T090 Run quickstart.md validation (follow all steps end-to-end)
- [X] T091 [P] Add type hints to all service methods
- [X] T092 [P] Add docstrings to all public methods

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on Board model
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on Board, Column, Task models
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 (board creation)
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 (board creation)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Depends on BoardMember model

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T005)
- All Foundational tasks marked [P] can run in parallel (T006-T016)
- Once Foundational phase completes:
  - Developer A: User Story 1 (board creation)
  - Developer B: User Story 2 (boards list)
  - Developer C: User Story 3 (board details)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create contract test for POST /api/boards in backend/tests/contract/test_boards_crud.py"
Task: "Create integration test for board creation flow in backend/tests/integration/test_board_flows.py"
Task: "Create validation test for board title in backend/tests/unit/test_board_service.py"

# Launch all models and schemas for User Story 1 together:
Task: "Create Board schema in backend/src/api/schemas/board.py"
Task: "Create board service in backend/src/services/board_service.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Create Board)
4. **STOP and VALIDATE**: Test board creation
   - Create board via POST /api/boards
   - Verify board created in database
   - Verify user is assigned as owner
   - Verify validation errors for invalid input
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Create Board) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (List Boards) → Test independently → Deploy/Demo
4. Add User Story 3 (Get Board) → Test independently → Deploy/Demo
5. Add User Story 4 (Update Board) → Test independently → Deploy/Demo
6. Add User Story 5 (Delete Board) → Test independently → Deploy/Demo
7. Add User Story 6 (Manage Members) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (board creation) + User Story 4 (update)
   - Developer B: User Story 2 (list boards) + User Story 3 (get board)
   - Developer C: User Story 5 (delete board) + User Story 6 (members)
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
| Phase 1: Setup | 5 | 5 | 0 | Project structure |
| Phase 2: Foundational | 11 | 11 | 0 | Models, migrations, permissions, auth |
| Phase 3: US1 (Create) | 10 | 10 | 0 | Board creation with tests |
| Phase 4: US2 (List) | 9 | 9 | 0 | Boards list with pagination (COMPLETE) |
| Phase 5: US3 (Get) | 11 | 11 | 0 | Board details with columns/tasks (COMPLETE) |
| Phase 6: US4 (Update) | 10 | 10 | 0 | Board update with owner check (COMPLETE) |
| Phase 7: US5 (Delete) | 9 | 9 | 0 | Cascade delete with tests (COMPLETE) |
| Phase 8: US6 (Members) | 16 | 16 | 0 | Member management with roles/permissions (COMPLETE) |
| Phase 9: Polish | 11 | 11 | 0 | Cross-cutting concerns |
| **Total** | **92** | **92** | **0** | **ALL TASKS COMPLETE!** |

**Completion Status**: 100% (92/92 tasks completed)

**Implementation Complete**: All core API functionality implemented (Phases 1-9)

**Test Coverage Complete**: All contract, integration, and unit tests implemented

**MVP Scope**: Phases 1-3 (26 tasks) - Board creation only ✓
**Full Feature**: All phases (92 tasks) - Complete boards CRUD with member management ✓
