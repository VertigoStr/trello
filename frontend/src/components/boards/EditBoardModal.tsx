/**
 * Edit board modal component.
 */

import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { validateUpdateBoard } from '@/utils/validation'
import { boardService } from '@/services/boardService'
import type { Board, UpdateBoardDTO } from '@/types/board'

interface EditBoardModalProps {
  show: boolean
  onHide: () => void
  board: Board | null
  onSuccess: (board: Board) => void
}

export function EditBoardModal({ show, onHide, board, onSuccess }: EditBoardModalProps) {
  const [formData, setFormData] = useState<UpdateBoardDTO>({
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Pre-fill form with current board data.
   */
  useEffect(() => {
    if (board) {
      setFormData({
        title: board.title,
        description: board.description || '',
      })
    }
  }, [board])

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
    const validationErrors = validateUpdateBoard(formData)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  /**
   * Handle form submission.
   */
  const handleSubmit = async () => {
    setSubmitError(null)

    if (!board || !validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const updatedBoard = await boardService.update(board.id, formData)
      onHide()
      onSuccess(updatedBoard)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update board')
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

  if (!board) {
    return null
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать доску</Modal.Title>
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
