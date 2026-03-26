/**
 * Tests for validation utilities.
 */

import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateName,
  validateRegisterForm,
  validateLoginForm,
  validateForgotPasswordForm,
  validateResetPasswordForm,
} from '@/utils/validation'

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.org')).toBe(true)
  })

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('should return true for valid password (min 8 chars)', () => {
    expect(validatePassword('password123')).toBe(true)
    expect(validatePassword('12345678')).toBe(true)
  })

  it('should return false for short password', () => {
    expect(validatePassword('pass')).toBe(false)
    expect(validatePassword('1234567')).toBe(false)
    expect(validatePassword('')).toBe(false)
  })
})

describe('validateName', () => {
  it('should return true for valid name (1-100 chars)', () => {
    expect(validateName('John')).toBe(true)
    expect(validateName('A')).toBe(true)
    expect(validateName('A'.repeat(100))).toBe(true)
  })

  it('should return false for invalid name', () => {
    expect(validateName('')).toBe(false)
    expect(validateName('   ')).toBe(false)
    expect(validateName('A'.repeat(101))).toBe(false)
  })
})

describe('validateRegisterForm', () => {
  it('should return empty errors for valid data', () => {
    const result = validateRegisterForm({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result).toEqual({})
  })

  it('should return errors for invalid data', () => {
    const result = validateRegisterForm({
      name: '',
      email: 'invalid',
      password: 'short',
    })
    expect(result.name).toBeDefined()
    expect(result.email).toBeDefined()
    expect(result.password).toBeDefined()
  })
})

describe('validateLoginForm', () => {
  it('should return empty errors for valid data', () => {
    const result = validateLoginForm({
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result).toEqual({})
  })

  it('should return errors for invalid data', () => {
    const result = validateLoginForm({
      email: 'invalid',
      password: '',
    })
    expect(result.email).toBeDefined()
    expect(result.password).toBeDefined()
  })
})

describe('validateForgotPasswordForm', () => {
  it('should return empty errors for valid email', () => {
    const result = validateForgotPasswordForm({
      email: 'john@example.com',
    })
    expect(result).toEqual({})
  })

  it('should return error for invalid email', () => {
    const result = validateForgotPasswordForm({
      email: 'invalid',
    })
    expect(result.email).toBeDefined()
  })
})

describe('validateResetPasswordForm', () => {
  it('should return empty errors for valid password', () => {
    const result = validateResetPasswordForm({
      password: 'newpassword123',
    })
    expect(result).toEqual({})
  })

  it('should return error for short password', () => {
    const result = validateResetPasswordForm({
      password: 'short',
    })
    expect(result.password).toBeDefined()
  })
})
