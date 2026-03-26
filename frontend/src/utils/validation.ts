/**
 * Validation utilities for board forms.
 */

import { BOARD_LIMITS } from '@/types/board'

/**
 * Validate board title.
 */
export function validateTitle(title: string): string | null {
  if (!title || !title.trim()) {
    return 'Название обязательно'
  }

  if (title.length > BOARD_LIMITS.TITLE_MAX) {
    return `Название не более ${BOARD_LIMITS.TITLE_MAX} символов`
  }

  return null
}

/**
 * Validate board description.
 */
export function validateDescription(description: string | undefined): string | null {
  if (!description) {
    return null
  }

  if (description.length > BOARD_LIMITS.DESCRIPTION_MAX) {
    return `Описание не более ${BOARD_LIMITS.DESCRIPTION_MAX} символов`
  }

  return null
}

/**
 * Validate create board form data.
 */
export function validateCreateBoard(data: { title: string; description?: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  const titleError = validateTitle(data.title)
  if (titleError) {
    errors.title = titleError
  }

  const descriptionError = validateDescription(data.description)
  if (descriptionError) {
    errors.description = descriptionError
  }

  return errors
}

/**
 * Validate update board form data.
 */
export function validateUpdateBoard(data: { title?: string; description?: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (data.title !== undefined) {
    const titleError = validateTitle(data.title)
    if (titleError) {
      errors.title = titleError
    }
  }

  if (data.description !== undefined) {
    const descriptionError = validateDescription(data.description)
    if (descriptionError) {
      errors.description = descriptionError
    }
  }

  return errors
}

/**
 * Validate login form data.
 */
export function validateLoginForm(data: { email: string; password: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.email || !data.email.includes('@')) {
    errors.email = 'Некорректный формат email'
  }

  if (!data.password) {
    errors.password = 'Введите пароль'
  }

  return errors
}

/**
 * Validate register form data.
 */
export function validateRegisterForm(data: { name: string; email: string; password: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'Имя обязательно'
  }

  if (!data.email || !data.email.includes('@')) {
    errors.email = 'Некорректный формат email'
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов'
  }

  return errors
}

/**
 * Validate forgot password form data.
 */
export function validateForgotPasswordForm(data: { email: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.email || !data.email.includes('@')) {
    errors.email = 'Некорректный формат email'
  }

  return errors
}

/**
 * Validate reset password form data.
 */
export function validateResetPasswordForm(data: { password: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.password || data.password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов'
  }

  return errors
}
