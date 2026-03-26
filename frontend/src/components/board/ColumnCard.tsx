/**
 * Column card component with sortable tasks.
 */

import React from 'react'
import { Card, Button } from 'react-bootstrap'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Column } from '@/types/column'
import type { Task } from '@/types/task'

interface ColumnCardProps {
  column: Column
  tasks: Task[]
  onAddTask: () => void
}

export function ColumnCard({ column, tasks, onAddTask }: ColumnCardProps) {
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white">
        <Card.Title className="mb-0 h5">{column.title}</Card.Title>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onAddTask}
        >
          + Задача
        </Button>
      </Card.Header>
      <Card.Body className="p-2">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-muted py-4">
            <small>Нет задач</small>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
