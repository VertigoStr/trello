/**
 * Registration page component.
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { FormError } from '@/components/common/FormError'
import { useAuth } from '@/hooks/useAuth'
import { validateRegisterForm } from '@/utils/validation'
import { ROUTES } from '@/types/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Client-side validation
    const validationErrors = validateRegisterForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Check passwords match
    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: 'Пароли не совпадают' })
      return
    }

    setIsLoading(true)

    try {
      await register(formData.name, formData.email, formData.password, formData.password_confirm)
      navigate(ROUTES.HOME)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Регистрация
        </h1>

        <FormError message={submitError} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Имя"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Введите ваше имя"
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="example@email.com"
            autoComplete="email"
          />

          <Input
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            error={errors.password_confirm}
            placeholder="Повторите пароль"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
          >
            Зарегистрироваться
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
