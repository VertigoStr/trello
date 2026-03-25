# Trello Clone - Docker Setup

Quick start guide for running Trello Clone with Docker.

## Prerequisites

- Docker 20+
- Docker Compose 2.x+

## Quick Start

### 1. Start All Services

```bash
# Start backend and database
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. Check Health

```bash
# Check backend health
curl http://localhost:8000/health/boards

# Check database status
docker-compose ps
```

### 3. Access API

- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Available Services

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 8000 | FastAPI backend |
| PostgreSQL | 5432 | Database |

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Remove all data (WARNING: deletes database!)
docker-compose down -v
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# PostgreSQL
POSTGRES_PASSWORD=trello_dev
POSTGRES_PORT=5432

# Backend
BACKEND_PORT=8000

# JWT Settings
JWT_SECRET_KEY=your-secret-key-change-in-production

# Test Mode
TEST_MODE=false
```

## API Endpoints

### Authentication (from 002-auth-api)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Boards (from 003-task-boards-crud)
- `POST /api/boards` - Create board
- `GET /api/boards` - List boards
- `GET /api/boards/{id}` - Get board details
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

### Board Members
- `POST /api/boards/{id}/members` - Add member
- `GET /api/boards/{id}/members` - List members
- `DELETE /api/boards/{id}/members/{user_id}` - Remove member
- `PUT /api/boards/{id}/members/{user_id}/role` - Update role

### Health Checks
- `GET /health/boards` - Boards health status
- `GET /health/users` - Users health status

## Development

### Run Migrations

Migrations are automatically applied on first database startup.

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U trello -d trello

# List tables
\dt

# Quit
\q
```

### Backend Shell

```bash
# Access backend container
docker-compose exec backend sh

# Run Python shell
docker-compose exec backend python
```

## Troubleshooting

### Port Already in Use

If port 8000 or 5432 is already in use, change ports in `.env`:

```env
BACKEND_PORT=8001
POSTGRES_PORT=5433
```

### Database Connection Error

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Backend Won't Start

```bash
# View backend logs
docker-compose logs backend

# Rebuild backend
docker-compose up -d --build backend
```

## Production Deployment

For production:

1. Change `JWT_SECRET_KEY` to a strong random value
2. Change `POSTGRES_PASSWORD` to a strong password
3. Use specific image versions instead of `latest`
4. Configure proper networking and firewall rules
5. Set up SSL/TLS termination
6. Configure backup strategy for PostgreSQL data

## Data Persistence

Database data is persisted in the `postgres_data` volume. To backup:

```bash
# Backup database
docker-compose exec postgres pg_dump -U trello trello > backup.sql

# Restore database
docker-compose exec -T postgres psql -U trello trello < backup.sql
```
