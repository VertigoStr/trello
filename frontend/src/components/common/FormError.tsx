/**
 * FormError component with Bootstrap styles.
 */

import React from 'react'

interface FormErrorProps {
  message?: string | null
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className="alert alert-danger d-flex align-items-center mb-3"
      role="alert"
    >
      <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Error:">
        <circle cx="12" cy="12" r="10" fill="currentColor" className="text-danger" />
        <path d="M12 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm.5 6a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3z" fill="white" />
      </svg>
      <div>{message}</div>
    </div>
  )
}
