/**
 * Delete board modal component with confirmation.
 */

import React, { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { boardService } from '@/services/boardService'
import type { Board } from '@/types/board'

interface DeleteBoardModalProps {
  show: boolean
  onHide: () => void
  board: Board | null
  onSuccess: () => void
}

export function DeleteBoardModal({ show, onHide, board, onSuccess }: DeleteBoardModalProps) {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if delete button should be enabled.
   */
  const isDeleteDisabled = !board || inputValue !== board.title

  /**
   * Handle input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setError(null)
  }

  /**
   * Handle delete confirmation.
   */
  const handleDelete = async () => {
    if (!board || isDeleteDisabled) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await boardService.delete(board.id)
      onHide()
      onSuccess()
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board')
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Handle modal close.
   */
  const handleClose = () => {
    setInputValue('')
    setError(null)
    onHide()
  }

  if (!board) {
    return null
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Удалить доску?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <p className="mb-3">
          Это действие нельзя отменить. Все колонки, задачи и участники будут удалены.
        </p>

        <p className="mb-2">
          Для подтверждения удаления введите название доски:
        </p>

        <Form.Group>
          <Form.Control
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder={board.title}
            isInvalid={error !== null && inputValue !== board.title}
            autoFocus
          />
          <Form.Control.Feedback type="invalid">
            Название не совпадает
          </Form.Control.Feedback>
        </Form.Group>

        <Alert variant="warning" className="mt-3 mb-0">
          <strong>Внимание:</strong> Вы удаляете доску <strong>{board.title}</strong>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
          Отмена
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleteDisabled || isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Удаление...
            </>
          ) : (
            'Удалить'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
