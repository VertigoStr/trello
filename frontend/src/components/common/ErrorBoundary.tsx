/**
 * Error boundary component for catching React errors.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, Button, Container } from 'react-bootstrap'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Произошла ошибка</Alert.Heading>
            <p>
              {this.state.error?.message || 'Что-то пошло не так'}
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button
                variant="outline-danger"
                onClick={() => window.location.reload()}
              >
                Перезагрузить страницу
              </Button>
            </div>
          </Alert>
        </Container>
      )
    }

    return this.props.children
  }
}
