# Quickstart: Frontend Authentication

**Feature**: 005-frontend-auth
**Date**: 2026-03-25
**Purpose**: Integration guide and usage examples

---

## Prerequisites

- Node.js 18+ installed
- Backend API running (002-auth-api feature)
- Backend URL: `http://localhost:8000`

---

## Step 1: Project Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at `http://localhost:5173`

---

## Step 2: Configure API URL

Create `.env` file in frontend root:

```env
VITE_API_URL=http://localhost:8000
```

---

## Step 3: User Registration Flow

### Via UI

1. Navigate to `/register`
2. Fill in the form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "securepassword123"
3. Click "Register"
4. Redirected to `/dashboard`

### Via Code

```typescript
import { authService } from '@/services/authService';

try {
  const { user, accessToken } = await authService.register(
    'john@example.com',
    'securepassword123',
    'John Doe'
  );
  
  console.log('Registered:', user.name);
} catch (error) {
  if (error.message.includes('Email already exists')) {
    // Handle duplicate email
  }
}
```

---

## Step 4: User Login Flow

### Via UI

1. Navigate to `/login`
2. Enter credentials:
   - Email: "john@example.com"
   - Password: "securepassword123"
3. Click "Login"
4. Redirected to `/` (dashboard)

### Via Code

```typescript
import { authService } from '@/services/authService';

try {
  const { user, accessToken } = await authService.login(
    'john@example.com',
    'securepassword123'
  );
  
  // Token automatically saved to localStorage
  console.log('Logged in:', user.name);
} catch (error) {
  if (error.message.includes('Invalid email or password')) {
    // Handle invalid credentials
  }
}
```

---

## Step 5: Protected Routes

```typescript
// In App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected routes */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } />
  
  <Route path="/profile" element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } />
</Routes>
```

---

## Step 6: Logout Flow

### Via UI

1. Click "Logout" button in header
2. Redirected to `/login`

### Via Code

```typescript
import { authService } from '@/services/authService';

await authService.logout();
// Token removed from localStorage
// Redirect to /login
```

---

## Step 7: Password Recovery Flow

### Request Reset

1. Navigate to `/forgot-password`
2. Enter email: "john@example.com"
3. Click "Send Reset Link"
4. Check email for reset link

### Reset Password

1. Click link from email: `/reset-password?token=abc123`
2. Enter new password: "newpassword456"
3. Click "Reset Password"
4. Redirected to `/login`

---

## Error Handling Examples

### Form Validation Errors

```typescript
// RegisterPage.tsx
const [errors, setErrors] = useState<RegisterFormErrors>({});

const handleSubmit = async (data: RegisterFormData) => {
  // Client-side validation
  const validationErrors = validateRegisterForm(data);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // API call
  try {
    await authService.register(data.email, data.password, data.name);
  } catch (error) {
    setErrors({ submit: error.message });
  }
};
```

### Token Expiration

```typescript
// useAuth.ts hook
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    try {
      const user = await authService.getCurrentUser();
      setIsAuthenticated(true);
      setUser(user);
    } catch (error) {
      // Token expired
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      navigate('/login');
    }
  };
  
  checkAuth();
}, []);
```

---

## Testing Examples

### Component Test

```typescript
// tests/pages/LoginPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginPage } from '@/pages/LoginPage';

describe('LoginPage', () => {
  it('shows validation error for invalid email', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    
    expect(screen.getByText(/некорректный email/i)).toBeInTheDocument();
  });
  
  it('submits form with valid credentials', async () => {
    const mockLogin = vi.fn();
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

### E2E Test (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete registration and login', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text="Test User"')).toBeVisible();
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
    
    // Login
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## Best Practices

### 1. Always Use Protected Routes

```typescript
// ✅ Correct
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />

// ❌ Wrong - no protection
<Route path="/dashboard" element={<DashboardPage />} />
```

### 2. Handle Token Expiration

```typescript
// Check token on every API call
async function fetchWithAuth(url: string, options: RequestInit) {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  
  return response;
}
```

### 3. Show Loading States

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

### 4. Clear Error States

```typescript
// Clear errors when user starts typing
useEffect(() => {
  if (errors.email) {
    setErrors(prev => ({ ...prev, email: undefined }));
  }
}, [formData.email]);
```
