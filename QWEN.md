# trello Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-26

## Active Technologies
- Python 3.11+ + FastAPI, PyJWT, bcrypt, SQLAlchemy (async) (002-auth-api)
- PostgreSQL 15+ (002-auth-api)
- Python 3.11+ (из existing auth API) + FastAPI, SQLAlchemy (async), PyJWT (из auth API), psycopg2 (003-task-boards-crud)
- PostgreSQL 15+ (из 001-local-dev-env) (003-task-boards-crud)
- Python 3.11+ (из existing auth API) + FastAPI, SQLAlchemy (async), PyJWT (из auth API), psycopg2, asyncpg (004-create-tasks-boards)
- TypeScript 5+ (из clarifications spec.md) + React 18+, React Router 6+, Vite (005-frontend-auth)
- localStorage для JWT токена (005-frontend-auth)
- TypeScript 5+ (из 005-frontend-auth) + React 18+, React Router 6+, Bootstrap 5, Vite (006-frontend-boards-crud)
- localStorage для JWT токена (из 005-frontend-auth) (006-frontend-boards-crud)
- TypeScript 5+ (из 005-frontend-auth) + React 18+, React Router 6+, Bootstrap 5, Vite, @dnd-kit (для drag-and-drop) (007-board-columns-tasks)

- Bash 5.x (macOS/Linux), PowerShell 7.x (Windows) + Docker 20+, docker-compose 2.x+, Gi (001-local-dev-env)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for Bash 5.x (macOS/Linux), PowerShell 7.x (Windows)

## Code Style

Bash 5.x (macOS/Linux), PowerShell 7.x (Windows): Follow standard conventions

## Recent Changes
- 007-board-columns-tasks: Added TypeScript 5+ (из 005-frontend-auth) + React 18+, React Router 6+, Bootstrap 5, Vite, @dnd-kit (для drag-and-drop)
- 006-frontend-boards-crud: Added TypeScript 5+ (из 005-frontend-auth) + React 18+, React Router 6+, Bootstrap 5, Vite
- 005-frontend-auth: Added TypeScript 5+ (из clarifications spec.md) + React 18+, React Router 6+, Vite


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
