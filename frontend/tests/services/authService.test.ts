/**
 * Tests for authService.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService } from '@/services/authService'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('register', () => {
    it('should call register endpoint and save token', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          user: { id: '1', name: 'Test', email: 'test@example.com', isActive: true, createdAt: '' },
          accessToken: 'token123',
        },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.register('Test', 'test@example.com', 'password123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123' }),
        })
      )
      expect(result.user.name).toBe('Test')
      expect(result.accessToken).toBe('token123')
      expect(localStorage.getItem('auth_token')).toBe('token123')
    })

    it('should throw error on registration failure', async () => {
      const mockResponse = {
        status: 'error',
        error: { code: 'EMAIL_EXISTS', message: 'Email already exists' },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      await expect(authService.register('Test', 'test@example.com', 'password123')).rejects.toThrow(
        'Email already exists'
      )
    })
  })

  describe('login', () => {
    it('should call login endpoint and save token', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          user: { id: '1', name: 'Test', email: 'test@example.com', isActive: true, createdAt: '' },
          accessToken: 'token123',
        },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.login('test@example.com', 'password123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      )
      expect(result.user.name).toBe('Test')
      expect(result.accessToken).toBe('token123')
      expect(localStorage.getItem('auth_token')).toBe('token123')
    })

    it('should throw error on login failure', async () => {
      const mockResponse = {
        status: 'error',
        error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Неверный email или пароль'
      )
    })
  })

  describe('logout', () => {
    it('should call logout endpoint and remove token', async () => {
      localStorage.setItem('auth_token', 'token123')
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'success', data: { message: 'Logged out' } }),
      })

      await authService.logout()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      )
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('should remove token even if logout request fails', async () => {
      localStorage.setItem('auth_token', 'token123')
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await authService.logout()

      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should call me endpoint and return user', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          user: { id: '1', name: 'Test', email: 'test@example.com', isActive: true, createdAt: '' },
        },
      }
      localStorage.setItem('auth_token', 'token123')
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.getCurrentUser()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      )
      expect(result.name).toBe('Test')
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        status: 'error',
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      }
      localStorage.setItem('auth_token', 'expiredtoken')
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      await expect(authService.getCurrentUser()).rejects.toThrow('Token has expired')
    })
  })

  describe('forgotPassword', () => {
    it('should call forgot-password endpoint', async () => {
      const mockResponse = {
        status: 'success',
        data: { message: 'Password reset instructions sent' },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      await authService.forgotPassword('test@example.com')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      )
    })
  })

  describe('resetPassword', () => {
    it('should call reset-password endpoint', async () => {
      const mockResponse = {
        status: 'success',
        data: { message: 'Password reset successfully' },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      await authService.resetPassword('reset-token-123', 'newpassword123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'reset-token-123', password: 'newpassword123' }),
        })
      )
    })

    it('should throw error on invalid token', async () => {
      const mockResponse = {
        status: 'error',
        error: { code: 'INVALID_OR_EXPIRED_TOKEN', message: 'Token is invalid or expired' },
      }
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      await expect(authService.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow(
        'Token is invalid or expired'
      )
    })
  })
})
