/**
 * Create column modal component.
 */

import React, { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { COLUMN_LIMITS } from '@/types/column'
import type { CreateColumnDTO } from '@/types/column'

interface CreateColumnModalProps {
  show: boolean
  onHide: () => void
  onCreate: (data: CreateColumnDTO) => Promise<void>
}

export function CreateColumnModal({ show, onHide, onCreate }: CreateColumnModalProps) {
  const [formData, setFormData] = useState<CreateColumnDTO>({
    title: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Validate form data.
   */
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Название обязательно'
    } else if (formData.title.length > COLUMN_LIMITS.TITLE_MAX) {
      newErrors.title = `Название не более ${COLUMN_LIMITS.TITLE_MAX} символов`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * Handle form submission.
   */
  const handleSubmit = async () => {
    setSubmitError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onCreate(formData)
      // Clear form on success
      setFormData({ title: '' })
      onHide()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create column')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle modal close.
   */
  const handleClose = () => {
    setFormData({ title: '' })
    setErrors({})
    setSubmitError(null)
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Создать колонку</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitError && (
          <Alert variant="danger" className="mb-3">
            {submitError}
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Название *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
              autoFocus
              placeholder="Например: To Do"
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Максимум {COLUMN_LIMITS.TITLE_MAX} символов
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Создание...
            </>
          ) : (
            'Создать'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
