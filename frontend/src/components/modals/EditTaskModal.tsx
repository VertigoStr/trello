/**
 * Edit task modal component.
 */

import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { TASK_LIMITS } from '@/types/task'
import type { Task, UpdateTaskDTO } from '@/types/task'

interface EditTaskModalProps {
  show: boolean
  onHide: () => void
  task: Task | null
  onUpdate: (data: UpdateTaskDTO) => Promise<Task>
}

export function EditTaskModal({ show, onHide, task, onUpdate }: EditTaskModalProps) {
  const [formData, setFormData] = useState<UpdateTaskDTO>({
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Pre-fill form with current task data.
   */
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
      })
    }
  }, [task])

  /**
   * Validate form data.
   */
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Название обязательно'
    } else if (formData.title.length > TASK_LIMITS.TITLE_MAX) {
      newErrors.title = `Название не более ${TASK_LIMITS.TITLE_MAX} символов`
    }

    if (formData.description && formData.description.length > TASK_LIMITS.DESCRIPTION_MAX) {
      newErrors.description = `Описание не более ${TASK_LIMITS.DESCRIPTION_MAX} символов`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!task || !validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onUpdate(formData)
      // Clear form on success
      setFormData({ title: '', description: '' })
      onHide()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle modal close.
   */
  const handleClose = () => {
    setFormData({ title: '', description: '' })
    setErrors({})
    setSubmitError(null)
    onHide()
  }

  if (!task) {
    return null
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать задачу</Modal.Title>
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
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Максимум {TASK_LIMITS.TITLE_MAX} символов
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Максимум {TASK_LIMITS.DESCRIPTION_MAX} символов
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
              Сохранение...
            </>
          ) : (
            'Сохранить'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
