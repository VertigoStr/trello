/**
 * Task card component with drag-and-drop support.
 */

import React from 'react'
import { Card, Dropdown } from 'react-bootstrap'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'

interface TaskCardProps {
  task: Task
  onDelete?: () => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    marginBottom: '8px',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <Card.Title className="mb-2 h6">{task.title}</Card.Title>
              {task.description && (
                <Card.Text className="text-muted small mb-0">
                  {task.description}
                </Card.Text>
              )}
            </div>
            {onDelete && (
              <Dropdown>
                <Dropdown.Toggle variant="link" size="sm" className="text-muted p-0 border-0">
                  ⋮
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item
                    className="text-danger"
                    onClick={onDelete}
                  >
                    Удалить
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
