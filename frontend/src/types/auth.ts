/**
 * Authentication types for frontend application.
 */

/**
 * User representation in the frontend application.
 */
export interface User {
  id: string // UUID
  email: string // Unique email
  name: string // Display name
  isActive: boolean // Account status
  createdAt: string // ISO 8601 timestamp
}

/**
 * JWT tokens for authentication.
 */
export interface AuthTokens {
  accessToken: string // JWT access token
  expiresAt?: number // Expiration timestamp (optional)
}

/**
 * Authentication state in the application.
 */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Successful API response.
 */
export interface SuccessResponse<T> {
  status: 'success'
  data: T
}

/**
 * Error API response.
 */
export interface ErrorResponse {
  status: 'error'
  error: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

/**
 * Union type for API responses.
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

/**
 * Specific API response types.
 */
export type RegisterResponse = ApiResponse<{ user: User; accessToken: string }>
export type LoginResponse = ApiResponse<{ user: User; accessToken: string }>
export type LogoutResponse = ApiResponse<{ message: string }>
export type ForgotPasswordResponse = ApiResponse<{ message: string }>
export type ResetPasswordResponse = ApiResponse<{ message: string }>
export type MeResponse = ApiResponse<{ user: User }>

/**
 * Form data types.
 */
export interface RegisterFormData {
  name: string
  email: string
  password: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  token: string
  password: string
}

/**
 * Error codes from backend.
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_OR_EXPIRED_TOKEN: 'INVALID_OR_EXPIRED_TOKEN',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Error messages mapping.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Ошибка валидации',
  [ERROR_CODES.EMAIL_EXISTS]: 'Email уже используется',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Неверный email или пароль',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Аккаунт заблокирован. Попробуйте позже.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Сессия истекла. Пожалуйста, войдите снова.',
  [ERROR_CODES.INVALID_OR_EXPIRED_TOKEN]: 'Ссылка для сброса недействительна или истекла',
  [ERROR_CODES.NETWORK_ERROR]: 'Ошибка сети. Проверьте соединение.',
}

/**
 * Storage keys.
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const

/**
 * Application routes.
 */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  DASHBOARD: '/',
  HOME: '/',
} as const
