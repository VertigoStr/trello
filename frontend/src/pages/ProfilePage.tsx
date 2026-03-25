/**
 * Profile page component (stub).
 */

import React from 'react'
import { useCurrentUser } from '@/hooks/useAuth'

export function ProfilePage() {
  const user = useCurrentUser()

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Профиль</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <p className="text-gray-900">{user?.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="text-gray-900">{user?.email}</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
