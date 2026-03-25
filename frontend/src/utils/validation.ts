/**
 * Validation utilities for form inputs.
 */

/**
 * Email validation regex.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates email format.
 * @param email - Email string to validate
 * @returns true if email is valid
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Validates password strength.
 * @param password - Password string to validate
 * @returns true if password meets requirements (min 8 characters)
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Validates name input.
 * @param name - Name string to validate
 * @returns true if name is valid (1-100 characters)
 */
export function validateName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 1 && trimmed.length <= 100
}

/**
 * Validates registration form data.
 * @param data - Registration form data
 * @returns Object with validation errors (empty if valid)
 */
export function validateRegisterForm(data: {
  name: string
  email: string
  password: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.name || !validateName(data.name)) {
    errors.name = 'Имя должно содержать от 1 до 100 символов'
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Некорректный формат email'
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.password = 'Пароль должен содержать минимум 8 символов'
  }

  return errors
}

/**
 * Validates login form data.
 * @param data - Login form data
 * @returns Object with validation errors (empty if valid)
 */
export function validateLoginForm(data: {
  email: string
  password: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Некорректный формат email'
  }

  if (!data.password) {
    errors.password = 'Введите пароль'
  }

  return errors
}

/**
 * Validates forgot password form data.
 * @param data - Forgot password form data
 * @returns Object with validation errors (empty if valid)
 */
export function validateForgotPasswordForm(data: {
  email: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Некорректный формат email'
  }

  return errors
}

/**
 * Validates reset password form data.
 * @param data - Reset password form data
 * @returns Object with validation errors (empty if valid)
 */
export function validateResetPasswordForm(data: {
  password: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.password || !validatePassword(data.password)) {
    errors.password = 'Пароль должен содержать минимум 8 символов'
  }

  return errors
}
