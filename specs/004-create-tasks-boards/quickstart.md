# Quickstart: Task Management API

**Feature**: 004-create-tasks-boards
**Date**: 2026-03-25
**Purpose**: Integration guide and usage examples

---

## Prerequisites

- Running backend API (003-task-boards-crud)
- Valid JWT token (from 002-auth-api)
- Existing board with at least one column

---

## Step 1: Create a Task

```bash
curl -X POST "http://localhost:8000/api/boards/{board_id}/columns/{column_id}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature",
    "description": "Add task creation API endpoint",
    "assignee_id": "user-uuid"
  }'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "task-uuid",
    "column_id": "column-uuid",
    "title": "Implement feature",
    "assignee_id": "user-uuid",
    "position": 1.0,
    "version": 1
  }
}
```

---

## Step 2: List Tasks on Board

```bash
curl -X GET "http://localhost:8000/api/boards/{board_id}/tasks?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

---

## Step 3: Update a Task (with Optimistic Locking)

```bash
# First, get the task and ETag
curl -X GET "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response includes ETag: "1" in headers

# Then update with If-Match header
curl -X PUT "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "If-Match: \"1\"" \
  -d '{
    "title": "Updated title",
    "description": "Updated description"
  }'
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "version": 2
  }
}
```

**Conflict Response** (412 Precondition Failed):
```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "Task was modified by another user",
    "current_version": 3,
    "current_data": {...}
  }
}
```

---

## Step 4: Move Task to Another Column

```bash
curl -X POST "http://localhost:8000/api/tasks/{task_id}/move" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "column_id": "new-column-uuid",
    "position": 2.5
  }'
```

---

## Step 5: Unassign Yourself from Task

```bash
curl -X POST "http://localhost:8000/api/tasks/{task_id}/unassign" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Step 6: Delete a Task (Soft Delete)

```bash
curl -X DELETE "http://localhost:8000/api/tasks/{task_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**: 204 No Content

---

## Permission Examples

### Example 1: Assignee Can Edit Their Task

```python
# User is assignee of task
# Even with "member" role (read-only), they can edit
response = requests.put(
    f"/api/tasks/{task_id}",
    headers={"Authorization": f"Bearer {token}"},
    json={"title": "My update"}
)
assert response.status_code == 200
```

### Example 2: Non-Assignee Needs Write Permission

```python
# User is NOT assignee and has only "read" permission
response = requests.put(
    f"/api/tasks/{task_id}",
    headers={"Authorization": f"Bearer {token}"},
    json={"title": "Unauthorized update"}
)
assert response.status_code == 403  # Access Denied
```

---

## Error Handling

### Validation Error (400)

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be 1-255 characters",
    "details": [
      {"field": "title", "message": "Value is too long"}
    ]
  }
}
```

### Access Denied (403)

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have write permission on this board"
  }
}
```

### Conflict (412)

```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "Task was modified by another user. Please refresh and try again.",
    "current_version": 5,
    "current_data": {
      "title": "Concurrent update",
      "description": "Changed by someone else"
    }
  }
}
```

---

## Best Practices

### 1. Always Use ETag for Updates

```python
# Get task with ETag
response = requests.get(f"/api/tasks/{task_id}")
etag = response.headers.get("ETag")

# Update with If-Match
response = requests.put(
    f"/api/tasks/{task_id}",
    headers={"If-Match": etag},
    json={"title": "Update"}
)

if response.status_code == 412:
    # Handle conflict - refresh data
    print("Task was modified, please review changes")
```

### 2. Handle Position as Float

```python
# Insert task between position 1.0 and 2.0
new_position = (1.0 + 2.0) / 2  # 1.5

# When precision issues arise, renumber all tasks
def renumber_positions(tasks):
    for i, task in enumerate(tasks, 1):
        task.position = float(i)
```

### 3. Check Permissions Before Operations

```python
# Client-side check (UX optimization)
if user_role == "owner" or user_role == "admin":
    # Can perform any operation
    pass
elif user_id == task.assignee_id:
    # Can edit own task only
    pass
elif "write" in permissions:
    # Can edit any task
    pass
else:
    # Read-only
    pass
```

---

## Testing

### Create Test Task

```python
@pytest.mark.asyncio
async def test_create_task(client, auth_headers, test_column_id):
    payload = {
        "title": "Test Task",
        "description": "Test description"
    }
    
    response = await client.post(
        f"/api/boards/test-board/columns/{test_column_id}/tasks",
        json=payload,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
```

### Test Optimistic Locking

```python
@pytest.mark.asyncio
async def test_update_task_conflict(client, auth_headers, task_id):
    # Get current ETag
    get_response = await client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    etag = get_response.headers["ETag"]
    
    # Simulate concurrent update
    await client.put(f"/api/tasks/{task_id}", json={"title": "Concurrent"}, headers=auth_headers)
    
    # Try to update with old ETag
    response = await client.put(
        f"/api/tasks/{task_id}",
        json={"title": "My update"},
        headers={**auth_headers, "If-Match": etag}
    )
    
    assert response.status_code == 412
    assert response.json()["error"]["code"] == "CONFLICT"
```
