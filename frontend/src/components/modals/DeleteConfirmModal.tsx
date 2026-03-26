/**
 * Delete confirmation modal component.
 */

import React, { useState } from 'react'
import { Modal, Button, Alert } from 'react-bootstrap'

interface DeleteConfirmModalProps {
  show: boolean
  onHide: () => void
  itemName: string
  itemType: 'task' | 'column'
  taskCount?: number
  onDelete: () => Promise<void>
}

export function DeleteConfirmModal({
  show,
  onHide,
  itemName,
  itemType,
  taskCount,
  onDelete,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle delete confirmation.
   */
  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await onDelete()
      onHide()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Handle modal close.
   */
  const handleClose = () => {
    setError(null)
    onHide()
  }

  const title = itemType === 'column' ? 'Удалить колонку?' : 'Удалить задачу?'
  const warning = itemType === 'column'
    ? `Эта колонка содержит ${taskCount || 0} задач(и). Все задачи будут удалены.`
    : 'Это действие нельзя отменить.'

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <p className="mb-3">
          {warning}
        </p>

        <p className="mb-2">
          Для подтверждения удаления введите название {itemType === 'column' ? 'колонки' : 'задачи'}:
        </p>

        <Alert variant="warning" className="mb-0">
          <strong>Внимание:</strong> Вы удаляете{' '}
          <strong>{itemName}</strong>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
          Отмена
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
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
