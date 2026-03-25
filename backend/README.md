# Trello Clone Backend API

Authentication and Registration API for Trello Clone application.

## Features

- User registration with email and password
- User login with JWT token generation
- User logout with token revocation
- Rate limiting for login attempts
- Account lockout after failed attempts
- Token blacklist for revoked tokens
- **Task Boards CRUD**: Create, read, update, delete boards with flexible permissions
- **Task Management**: Create, read, update, move, delete tasks with optimistic locking
- **Board Members**: Add, remove, and manage member roles and permissions

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy (async)
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: bcrypt
- **Testing**: pytest + pytest-asyncio

## Quick Start

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 15+ (or use Docker from `001-local-dev-env` feature)

### Installation

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql+asyncpg://trello:trello_dev@localhost:5432/trello
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
BCRYPT_COST_FACTOR=12
```

### Running the Server

```bash
# Development mode with auto-reload
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: `http://localhost:8000`

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with database status |
| GET | `/ready` | Readiness check |
| GET | `/live` | Liveness check |

## Usage Examples

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "status": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800
  }
}
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/contract/test_register.py -v

# Run tests by marker
pytest -m unit
pytest -m integration
pytest -m contract
```

## Rate Limiting

Login endpoint has rate limiting:
- **5 attempts per 15 minutes** per email
- After 5 failed attempts, account is locked for 15 minutes
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in window
  - `X-RateLimit-Reset`: Seconds until limit resets

## Security

### Password Requirements

- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one digit (0-9)

### Token Security

- JWT tokens expire after 7 days (168 hours)
- Revoked tokens are blacklisted
- Token JTI (JWT ID) tracked for blacklist

### Account Security

- Account locked after 5 failed login attempts
- Lockout duration: 15 minutes
- Failed attempts reset on successful login

## Maintenance

### Cleanup Expired Tokens

Run periodically to clean up expired tokens:

```bash
python -m src.scripts.cleanup_tokens
```

Or schedule via cron:
```bash
# Daily at 2 AM
0 2 * * * cd /path/to/backend && python -m src.scripts.cleanup_tokens
```

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   └── health.py     # Health check endpoints
│   │   ├── schemas/
│   │   │   ├── register.py   # Registration schemas
│   │   │   └── login.py      # Login schemas
│   │   ├── main.py           # FastAPI app factory
│   │   └── router.py         # API router configuration
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_create_users.py
│   │   │   └── 002_create_access_tokens.py
│   │   ├── database.py       # Database configuration
│   │   ├── base.py           # Base model class
│   │   └── connection.py     # DB connection dependency
│   ├── middleware/
│   │   ├── auth_middleware.py  # JWT authentication
│   │   ├── cors.py           # CORS configuration
│   │   ├── error_handler.py  # Error handling
│   │   ├── rate_limiter.py   # Rate limiting
│   │   └── request_id.py     # Request ID tracking
│   ├── models/
│   │   ├── user.py           # User model
│   │   └── token.py          # AccessToken model
│   ├── services/
│   │   ├── auth_service.py   # Authentication logic
│   │   ├── jwt_service.py    # JWT operations
│   │   └── password_service.py # Password hashing
│   ├── scripts/
│   │   └── cleanup_tokens.py # Token cleanup script
│   ├── utils/
│   │   └── sanitization.py   # Input sanitization
│   └── core/
│       └── logging.py        # Logging configuration
├── tests/
│   ├── contract/             # API contract tests
│   ├── integration/          # Integration tests
│   └── unit/                 # Unit tests
├── requirements.txt
├── pytest.ini
└── .env.example
```

## Tasks API Examples

### Create a Task

```bash
curl -X POST "http://localhost:8000/api/boards/{board_id}/columns/{column_id}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature",
    "description": "Add task creation API endpoint",
    "assignee_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### List Tasks with Pagination

```bash
curl -X GET "http://localhost:8000/api/boards/{board_id}/tasks?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a Task (with Optimistic Locking)

```bash
# Get current ETag from response headers
curl -X GET "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update with If-Match header
curl -X PUT "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "If-Match: \"1\"" \
  -d '{
    "title": "Updated title",
    "description": "Updated description"
  }'
```

### Move a Task

```bash
curl -X POST "http://localhost:8000/api/tasks/{task_id}/move" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "column_id": "new-column-uuid",
    "position": 2.5
  }'
```

### Delete a Task (Soft Delete)

```bash
curl -X DELETE "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Unassign from Task

```bash
curl -X POST "http://localhost:8000/api/tasks/{task_id}/unassign" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## License

Internal use only.
