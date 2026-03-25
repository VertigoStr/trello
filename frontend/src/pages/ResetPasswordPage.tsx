/**
 * Reset password page component (stub).
 */

import React, { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { FormError } from '@/components/common/FormError'
import { validateResetPasswordForm } from '@/utils/validation'
import { ROUTES } from '@/types/auth'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError('')

    if (!token) {
      setError('Недействительная ссылка для сброса пароля')
      return
    }

    const validationErrors = validateResetPasswordForm({ password })
    if (Object.keys(validationErrors).length > 0) {
      setFieldError(validationErrors.password)
      return
    }

    setIsLoading(true)

    // TODO: Integrate with authService.resetPassword()
    setTimeout(() => {
      setIsLoading(false)
      navigate(ROUTES.LOGIN, { state: { message: 'Пароль успешно изменён' } })
    }, 1000)
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Недействительная ссылка
          </h1>
          <p className="text-gray-600 mb-6">
            Ссылка для сброса пароля недействительна или истекла.
          </p>
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button fullWidth>Запросить новую ссылку</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Сброс пароля
        </h1>
        <p className="text-gray-600 mb-6">
          Введите новый пароль для вашего аккаунта.
        </p>

        <FormError message={error} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Новый пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldError}
            placeholder="Минимум 8 символов"
          />

          <Button type="submit" fullWidth isLoading={isLoading} className="mt-6">
            Сбросить пароль
          </Button>
        </form>

        <p className="mt-4 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
