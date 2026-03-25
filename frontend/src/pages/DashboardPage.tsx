/**
 * Dashboard page component (stub).
 */

import React from 'react'

export function DashboardPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Добро пожаловать!
      </h1>
      <p className="text-gray-600">
        Это главная страница. Здесь будет список ваших досок.
      </p>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">
          У вас пока нет досок. Создайте свою первую доску!
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
