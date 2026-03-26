/**
 * Delete column modal component.
 * Reuses DeleteConfirmModal with column-specific configuration.
 */

import React from 'react'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import type { Column } from '@/types/column'

interface DeleteColumnModalProps {
  show: boolean
  onHide: () => void
  column: Column | null
  taskCount: number
  onDelete: () => Promise<void>
}

export function DeleteColumnModal({
  show,
  onHide,
  column,
  taskCount,
  onDelete,
}: DeleteColumnModalProps) {
  if (!column) {
    return null
  }

  return (
    <DeleteConfirmModal
      show={show}
      onHide={onHide}
      itemName={column.title}
      itemType="column"
      taskCount={taskCount}
      onDelete={onDelete}
    />
  )
}
