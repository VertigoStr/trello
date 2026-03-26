/**
 * Column card component with sortable tasks.
 */

import React from 'react'
import { Card, Button, Dropdown } from 'react-bootstrap'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Column } from '@/types/column'
import type { Task } from '@/types/task'

interface ColumnCardProps {
  column: Column
  tasks: Task[]
  onAddTask: () => void
  onTaskDelete?: (task: Task) => void
  onEditColumn?: () => void
}

export function ColumnCard({ column, tasks, onAddTask, onTaskDelete, onEditColumn }: ColumnCardProps) {
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white">
        <div className="d-flex align-items-center">
          <Card.Title className="mb-0 h5">{column.title}</Card.Title>
          {onEditColumn && (
            <Dropdown className="ms-2">
              <Dropdown.Toggle variant="link" size="sm" className="text-muted p-0 border-0">
                ⋮
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={onEditColumn}>
                  Переименовать
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
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
            <TaskCard key={task.id} task={task} onDelete={onTaskDelete ? () => onTaskDelete(task) : undefined} />
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
