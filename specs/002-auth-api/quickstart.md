# Quickstart: Authentication & Registration API

**Purpose**: Быстрый старт разработки и тестирования auth API

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (из локального окружения `001-local-dev-env`)
- Docker и docker-compose (для запуска БД)

## Installation

### Step 1: Start Database

```bash
# Запустить PostgreSQL из локального окружения
cd /Users/ramilmasoutov/workspace/projects/trello/trello
./scripts/start.sh
```

Проверить, что PostgreSQL доступен на порту 5432.

### Step 2: Create Backend Directory

```bash
mkdir -p backend
cd backend
```

### Step 3: Initialize Python Project

```bash
# Создать виртуальное окружение
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# или
.\venv\Scripts\Activate.ps1  # Windows

# Установить зависимости
pip install fastapi uvicorn sqlalchemy pyjwt bcrypt python-dotenv
pip install pytest pytest-asyncio httpie  # для тестирования
```

### Step 4: Create Project Structure

```bash
mkdir -p src/models src/services src/api/routes src/api/schemas src/middleware tests
touch src/__init__.py src/models/__init__.py src/services/__init__.py src/api/__init__.py
```

### Step 5: Configure Database Connection

Создать файл `.env` в корне backend:

```env
DATABASE_URL=postgresql://trello:trello_dev@localhost:5432/trello
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
BCRYPT_COST_FACTOR=12
```

---

## Running the API

### Development Mode

```bash
# Запустить сервер разработки
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

API доступно по адресу: `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Testing the API

### Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "password_confirm": "TestPass123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Running Tests

```bash
# Запустить все тесты
pytest

# Запустить с покрытием
pytest --cov=src

# Запустить конкретный тест
pytest tests/unit/test_auth_service.py -v
```

---

## Troubleshooting

### Database Connection Error

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Проверить, что PostgreSQL запущен
docker-compose ps

# Перезапустить PostgreSQL
docker-compose restart postgres
```

### Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Активировать виртуальное окружение
source venv/bin/activate

# Переустановить зависимости
pip install -r requirements.txt
```

### JWT Validation Error

**Error**: `Invalid token` или `Token expired`

**Solution**:
- Проверить JWT_SECRET_KEY в .env (должен совпадать)
- Проверить срок действия токена (7 дней = 168 часов)
- Войти заново для получения нового токена

---

## Next Steps

1. Изучить [data-model.md](data-model.md) для понимания моделей данных
2. Изучить [contracts/auth-api.md](contracts/auth-api.md) для API спецификации
3. Запустить `/speckit.tasks` для создания списка задач по реализации

## Support

При возникновении проблем:
1. Проверить логи: `docker-compose logs postgres`
2. Проверить логи приложения в консоли
3. Открыть issue в репозитории
