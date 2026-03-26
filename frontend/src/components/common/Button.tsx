/**
 * Button component with Bootstrap styles.
 */

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'btn'
  
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-100' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="d-flex align-items-center justify-content-center">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
