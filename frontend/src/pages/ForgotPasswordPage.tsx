/**
 * Forgot password page component (stub).
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { FormError } from '@/components/common/FormError'
import { validateForgotPasswordForm } from '@/utils/validation'
import { ROUTES } from '@/types/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError('')

    const validationErrors = validateForgotPasswordForm({ email })
    if (Object.keys(validationErrors).length > 0) {
      setFieldError(validationErrors.email)
      return
    }

    setIsLoading(true)

    // TODO: Integrate with authService.forgotPassword()
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1000)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Проверьте email
          </h1>
          <p className="text-gray-600 mb-6">
            Мы отправили инструкцию по сбросу пароля на {email}
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button fullWidth>Вернуться ко входу</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Забыли пароль?
        </h1>
        <p className="text-gray-600 mb-6">
          Введите ваш email и мы отправим инструкцию по сбросу пароля.
        </p>

        <FormError message={error} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError}
            placeholder="example@email.com"
          />

          <Button type="submit" fullWidth isLoading={isLoading} className="mt-6">
            Отправить
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

export default ForgotPasswordPage
