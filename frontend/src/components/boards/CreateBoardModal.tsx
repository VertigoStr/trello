/**
 * Create board modal component.
 */

import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { validateCreateBoard } from '@/utils/validation'
import { boardService } from '@/services/boardService'
import type { CreateBoardDTO } from '@/types/board'

interface CreateBoardModalProps {
  show: boolean
  onHide: () => void
}

export function CreateBoardModal({ show, onHide }: CreateBoardModalProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreateBoardDTO>({
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Handle form field change.
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
   * Validate form data.
   */
  const validate = () => {
    const validationErrors = validateCreateBoard(formData)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
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
      const board = await boardService.create(formData)
      onHide()
      navigate(`/board/${board.id}`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create board')
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

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Создать доску</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitError && (
          <div className="alert alert-danger" role="alert">
            {submitError}
          </div>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Название *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Введите название доски"
              isInvalid={!!errors.title}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Введите описание (опционально)"
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Максимум {10000} символов
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
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
