/**
 * Authentication service for API integration.
 */

import type {
  RegisterFormData,
  LoginFormData,
  RegisterResponse,
  LoginResponse,
  LogoutResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  MeResponse,
  User,
} from '@/types/auth'

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

/**
 * Makes an authenticated fetch request.
 */
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const data = await response.json()

  // Handle 401 Unauthorized (token expired)
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }

  // Handle error responses
  if (data.status === 'error') {
    throw new Error(data.error.message)
  }

  return data
}

/**
 * Register a new user.
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: User; accessToken: string }> {
  const response = await fetchWithAuth<RegisterResponse>(
    `${API_BASE}/api/auth/register`,
    {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }
  )

  if (response.status === 'success') {
    const { user, accessToken } = response.data
    localStorage.setItem('auth_token', accessToken)
    return { user, accessToken }
  }

  throw new Error('Registration failed')
}

/**
 * Login user with email and password.
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: User; accessToken: string }> {
  const response = await fetchWithAuth<LoginResponse>(
    `${API_BASE}/api/auth/login`,
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  )

  if (response.status === 'success') {
    const { user, accessToken } = response.data
    localStorage.setItem('auth_token', accessToken)
    return { user, accessToken }
  }

  throw new Error('Login failed')
}

/**
 * Logout user and clear token.
 */
export async function logout(): Promise<void> {
  try {
    await fetchWithAuth<LogoutResponse>(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
    })
  } catch (error) {
    // Ignore errors during logout
  } finally {
    localStorage.removeItem('auth_token')
  }
}

/**
 * Request password reset email.
 */
export async function forgotPassword(email: string): Promise<void> {
  await fetchWithAuth<ForgotPasswordResponse>(
    `${API_BASE}/api/auth/forgot-password`,
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  )
}

/**
 * Reset password with token.
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  await fetchWithAuth<ResetPasswordResponse>(
    `${API_BASE}/api/auth/reset-password`,
    {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }
  )
}

/**
 * Get current user data.
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetchWithAuth<MeResponse>(`${API_BASE}/api/auth/me`)

  if (response.status === 'success') {
    return response.data.user
  }

  throw new Error('Failed to get user data')
}

export const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
}
