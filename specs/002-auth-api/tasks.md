# Tasks: Authentication & Registration API

**Input**: Design documents from `/specs/002-auth-api/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/auth-api.md, research.md, quickstart.md

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

- [X] T001 Create backend directory structure: backend/, backend/src/, backend/tests/
- [X] T002 [P] Initialize Python 3.11 project with virtual environment in backend/
- [X] T003 [P] Create requirements.txt with FastAPI, uvicorn, SQLAlchemy, PyJWT, bcrypt, python-dotenv
- [X] T004 [P] Create .env.example with DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, BCRYPT_COST_FACTOR
- [X] T005 [P] Create .gitignore for Python project in backend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create database configuration in backend/src/db/database.py with SQLAlchemy async engine
- [X] T007 [P] Create base model class in backend/src/db/base.py with SQLAlchemy declarative base
- [X] T008 [P] Create database connection module in backend/src/db/connection.py with get_db dependency
- [X] T009 [P] Create FastAPI application factory in backend/src/api/main.py
- [X] T010 [P] Create API router configuration in backend/src/api/router.py with /api/auth prefix
- [X] T011 [P] Create error handling middleware in backend/src/middleware/error_handler.py with standard error response format
- [X] T012 [P] Create logging configuration in backend/src/core/logging.py with structured logging
- [X] T013 [P] Create pytest configuration in backend/pytest.ini with test markers and asyncio settings
- [X] T014 [P] Create test database fixture in backend/tests/conftest.py with test DB setup/teardown

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Регистрация нового пользователя (Priority: P1) 🎯 MVP

**Goal**: Реализовать API регистрации нового пользователя с выдачей токена доступа

**Independent Test**: Пользователь может создать аккаунт с уникальным email и получить токен доступа через POST /api/auth/register

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T015 [P] [US1] Create contract test for POST /api/auth/register in backend/tests/contract/test_register.py
- [X] T016 [P] [US1] Create integration test for successful registration in backend/tests/integration/test_register_flow.py
- [X] T017 [P] [US1] Create test for duplicate email validation in backend/tests/unit/test_user_validation.py

### Implementation for User Story 1

- [X] T018 [P] [US1] Create User model in backend/src/models/user.py with all fields from data-model.md
- [X] T019 [P] [US1] Create database migrations for users table in backend/src/db/migrations/001_create_users.py
- [X] T020 [P] [US1] Create password hashing service in backend/src/services/password_service.py with bcrypt
- [X] T021 [P] [US1] Create JWT service in backend/src/services/jwt_service.py with token generation and validation
- [X] T022 [US1] Create registration request schema in backend/src/api/schemas/register.py with Pydantic validation
- [X] T023 [US1] Create registration response schema in backend/src/api/schemas/register.py
- [X] T024 [US1] Implement registration service in backend/src/services/auth_service.py with email uniqueness check
- [X] T025 [US1] Implement password validation logic in backend/src/services/password_service.py (8 chars, letters + digits)
- [X] T026 [US1] Create registration endpoint POST /api/auth/register in backend/src/api/routes/auth.py
- [X] T027 [US1] Add error handling for duplicate email in backend/src/api/routes/auth.py with 409 response
- [X] T028 [US1] Add error handling for validation errors in backend/src/api/routes/auth.py with 400 response
- [X] T029 [US1] Add structured logging for registration events in backend/src/services/auth_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Вход в систему (Priority: P1)

**Goal**: Реализовать API входа с выдачей JWT токена

**Independent Test**: Пользователь с существующим аккаунтом может войти через POST /api/auth/login и получить токен

### Tests for User Story 2

- [X] T030 [P] [US2] Create contract test for POST /api/auth/login in backend/tests/contract/test_login.py
- [X] T031 [P] [US2] Create integration test for successful login in backend/tests/integration/test_login_flow.py
- [X] T032 [P] [US2] Create test for invalid credentials in backend/tests/unit/test_auth_service.py
- [X] T033 [P] [US2] Create test for rate limiting in backend/tests/unit/test_rate_limiter.py

### Implementation for User Story 2

- [X] T034 [P] [US2] Create login request schema in backend/src/api/schemas/login.py
- [X] T035 [P] [US2] Create login response schema in backend/src/api/schemas/login.py
- [X] T036 [P] [US2] Create in-memory rate limiter in backend/src/middleware/rate_limiter.py with sliding window
- [X] T037 [US2] Implement login service method in backend/src/services/auth_service.py with password verification
- [X] T038 [US2] Implement account lockout logic in backend/src/services/auth_service.py (5 attempts, 15 min lock)
- [X] T039 [US2] Create login endpoint POST /api/auth/login in backend/src/api/routes/auth.py
- [X] T040 [US2] Add rate limiting to login endpoint in backend/src/api/routes/auth.py (5 requests per 15 min per email)
- [X] T041 [US2] Add failed login attempt tracking in backend/src/models/user.py
- [X] T042 [US2] Add 401 response for invalid credentials in backend/src/api/routes/auth.py
- [X] T043 [US2] Add 423 response for locked account in backend/src/api/routes/auth.py
- [X] T044 [US2] Add structured logging for login attempts in backend/src/services/auth_service.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Выход из системы (Priority: P2)

**Goal**: Реализовать API выхода с аннулированием JWT токена

**Independent Test**: Авторизованный пользователь может выйти через POST /api/auth/logout, токен добавляется в blacklist

### Tests for User Story 3

- [ ] T045 [P] [US3] Create contract test for POST /api/auth/logout in backend/tests/contract/test_logout.py
- [ ] T046 [P] [US3] Create integration test for logout flow in backend/tests/integration/test_logout_flow.py
- [ ] T047 [P] [US3] Create test for token blacklist validation in backend/tests/unit/test_jwt_service.py

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create AccessToken model (token blacklist) in backend/src/models/token.py
- [ ] T049 [P] [US3] Create database migrations for access_tokens table in backend/src/db/migrations/002_create_access_tokens.py
- [ ] T050 [P] [US3] Create JWT middleware in backend/src/middleware/auth_middleware.py with token validation
- [ ] T051 [US3] Implement token blacklist check in backend/src/services/jwt_service.py
- [ ] T052 [US3] Implement token revocation method in backend/src/services/jwt_service.py
- [ ] T053 [US3] Create logout endpoint POST /api/auth/logout in backend/src/api/routes/auth.py
- [ ] T054 [US3] Add JWT dependency injection to logout endpoint in backend/src/api/routes/auth.py
- [ ] T055 [US3] Add token to blacklist on logout in backend/src/services/auth_service.py
- [ ] T056 [US3] Add 401 response for invalid/expired token in backend/src/api/routes/auth.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T057 [P] Create health check endpoint GET /health in backend/src/api/routes/health.py
- [ ] T058 [P] Add CORS middleware in backend/src/middleware/cors.py for frontend integration
- [ ] T059 [P] Add request ID middleware in backend/src/middleware/request_id.py for tracing
- [ ] T060 [P] Create API documentation in backend/README.md with usage examples
- [ ] T061 [P] Add input sanitization utilities in backend/src/utils/sanitization.py
- [ ] T062 [P] Create database cleanup script for expired tokens in backend/scripts/cleanup_tokens.py
- [ ] T063 [P] Add performance monitoring decorators in backend/src/utils/monitoring.py
- [ ] T064 Run full integration test suite
- [ ] T065 Run quickstart.md validation (follow all steps end-to-end)
- [ ] T066 [P] Add type hints to all service methods
- [ ] T067 [P] Add docstrings to all public methods

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on User model and password_service from US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on JWT service from US1

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- All Foundational tasks marked [P] can run in parallel (T006-T014)
- Once Foundational phase completes:
  - Developer A: User Story 1 (registration)
  - Developer B: User Story 2 (login) - after T020, T021 complete
  - Developer C: User Story 3 (logout) - after T021 complete
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create contract test for POST /api/auth/register in backend/tests/contract/test_register.py"
Task: "Create integration test for successful registration in backend/tests/integration/test_register_flow.py"
Task: "Create test for duplicate email validation in backend/tests/unit/test_user_validation.py"

# Launch all services for User Story 1 together:
Task: "Create password hashing service in backend/src/services/password_service.py"
Task: "Create JWT service in backend/src/services/jwt_service.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Registration)
4. **STOP and VALIDATE**: Test registration flow
   - Register new user via POST /api/auth/register
   - Verify user created in database
   - Verify JWT token returned and valid
   - Verify duplicate email rejected with 409
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Registration) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Login) → Test independently → Deploy/Demo
4. Add User Story 3 (Logout) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (registration, password_service, jwt_service)
   - Developer B: User Story 2 (login, rate_limiter, account lockout)
   - Developer C: User Story 3 (logout, token blacklist, auth middleware)
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

| Phase | Total | Description |
|-------|-------|-------------|
| Phase 1: Setup | 5 | Project initialization |
| Phase 2: Foundational | 9 | Database and API infrastructure |
| Phase 3: US1 (Registration) | 15 | Registration with tests |
| Phase 4: US2 (Login) | 15 | Login with rate limiting |
| Phase 5: US3 (Logout) | 12 | Logout with token blacklist |
| Phase 6: Polish | 11 | Cross-cutting concerns |
| **Total** | **67** | |

**MVP Scope**: Phases 1-3 (29 tasks) - Registration only
**Full Feature**: All phases (67 tasks) - Complete auth system
