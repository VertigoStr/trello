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
