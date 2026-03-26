/**
 * Task card component with drag-and-drop support.
 */

import React from 'react'
import { Card } from 'react-bootstrap'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
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
          <Card.Title className="mb-2 h6">{task.title}</Card.Title>
          {task.description && (
            <Card.Text className="text-muted small mb-0">
              {task.description}
            </Card.Text>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
