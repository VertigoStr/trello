/**
 * Tests for board validation utilities.
 */

import { describe, it, expect } from 'vitest'
import { validateCreateBoard, validateUpdateBoard, validateTitle, validateDescription } from '@/utils/validation'

describe('validateTitle', () => {
  it('should return null for valid title', () => {
    expect(validateTitle('My Board')).toBeNull()
    expect(validateTitle('A'.repeat(255))).toBeNull()
  })

  it('should return error for empty title', () => {
    expect(validateTitle('')).toBe('Название обязательно')
    expect(validateTitle('   ')).toBe('Название обязательно')
  })

  it('should return error for title too long', () => {
    expect(validateTitle('A'.repeat(256))).toBe('Название не более 255 символов')
  })
})

describe('validateDescription', () => {
  it('should return null for valid description', () => {
    expect(validateDescription('My description')).toBeNull()
    expect(validateDescription('')).toBeNull()
    expect(validateDescription(undefined)).toBeNull()
  })

  it('should return error for description too long', () => {
    expect(validateDescription('A'.repeat(10001))).toBe('Описание не более 10000 символов')
  })
})

describe('validateCreateBoard', () => {
  it('should return empty errors for valid data', () => {
    const result = validateCreateBoard({
      title: 'My Board',
      description: 'My description',
    })
    expect(result).toEqual({})
  })

  it('should return error for empty title', () => {
    const result = validateCreateBoard({
      title: '',
      description: 'My description',
    })
    expect(result.title).toBe('Название обязательно')
  })

  it('should return error for title too long', () => {
    const result = validateCreateBoard({
      title: 'A'.repeat(256),
      description: 'My description',
    })
    expect(result.title).toBe('Название не более 255 символов')
  })

  it('should return error for description too long', () => {
    const result = validateCreateBoard({
      title: 'My Board',
      description: 'A'.repeat(10001),
    })
    expect(result.description).toBe('Описание не более 10000 символов')
  })

  it('should accept optional description', () => {
    const result = validateCreateBoard({
      title: 'My Board',
    })
    expect(result).toEqual({})
  })
})

describe('validateUpdateBoard', () => {
  it('should return empty errors for valid data', () => {
    const result = validateUpdateBoard({
      title: 'Updated Title',
      description: 'Updated description',
    })
    expect(result).toEqual({})
  })

  it('should return error for empty title', () => {
    const result = validateUpdateBoard({
      title: '',
    })
    expect(result.title).toBe('Название обязательно')
  })

  it('should accept partial update with only title', () => {
    const result = validateUpdateBoard({
      title: 'Updated Title',
    })
    expect(result).toEqual({})
  })

  it('should accept partial update with only description', () => {
    const result = validateUpdateBoard({
      description: 'Updated description',
    })
    expect(result).toEqual({})
  })

  it('should accept empty update', () => {
    const result = validateUpdateBoard({})
    expect(result).toEqual({})
  })
})
