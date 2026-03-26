/**
 * Input component with Bootstrap styles.
 */

import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="mb-3">
        {label && (
          <label
            htmlFor={inputId}
            className="form-label"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
          {...props}
        />
        {error && (
          <div className="invalid-feedback" role="alert">
            {error}
          </div>
        )}
        {helperText && !error && (
          <small className="form-text text-muted">{helperText}</small>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
