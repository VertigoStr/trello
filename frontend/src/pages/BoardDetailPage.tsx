/**
 * Board detail page - view board with columns and tasks.
 */

import React, { useState } from 'react'
import { Container, Spinner, Alert, Button, Card, Dropdown } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { boardService } from '@/services/boardService'
import { useBoard } from '@/hooks/useBoard'
import { ColumnCard } from '@/components/board/ColumnCard'
import { TaskCard } from '@/components/board/TaskCard'
import { CreateColumnModal } from '@/components/modals/CreateColumnModal'
import { CreateTaskModal } from '@/components/modals/CreateTaskModal'
import { EditTaskModal } from '@/components/modals/EditTaskModal'
import { EditColumnModal } from '@/components/modals/EditColumnModal'
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal'
import { EditBoardModal } from '@/components/boards/EditBoardModal'
import { DeleteBoardModal } from '@/components/boards/DeleteBoardModal'
import type { Board } from '@/types/board'
import type { Task } from '@/types/task'

export function BoardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { board, columns, tasks, loading, error, createColumn, createTask, moveTask, deleteTask, updateColumn } = useBoard(id!)
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null)
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false)
  const [showEditColumnModal, setShowEditColumnModal] = useState(false)

  /**
   * Handle drag end.
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const taskId = active.id as string
    const newColumnId = over.id as string

    if (taskId && newColumnId) {
      try {
        await moveTask(taskId, { columnId: newColumnId, position: 0 })
      } catch (err) {
        // Error is handled by useBoard hook (rollback + error message)
      }
    }
  }

  /**
   * Handle edit success.
   */
  const handleEditSuccess = (updatedBoard: Board) => {
    setShowEditModal(false)
  }

  /**
   * Handle delete success.
   */
  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    navigate('/')
  }

  /**
   * Handle add task click.
   */
  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCreateTaskModal(true)
  }

  /**
   * Handle delete task click.
   */
  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task)
    setShowDeleteTaskModal(true)
  }

  /**
   * Handle delete task confirmation.
   */
  const handleDeleteTaskConfirm = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id)
      setShowDeleteTaskModal(false)
      setSelectedTask(null)
    }
  }

  /**
   * Handle edit column click.
   */
  const handleEditColumn = (column: Column) => {
    setSelectedColumn(column)
    setShowEditColumnModal(true)
  }

  /**
   * Handle edit column success.
   */
  const handleEditColumnSuccess = async (data: { title: string }) => {
    if (selectedColumn) {
      await updateColumn(selectedColumn.id, data)
      setShowEditColumnModal(false)
      setSelectedColumn(null)
    }
  }

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    )
  }

  /**
   * Error state.
   */
  if (error || !board) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error || 'Доска не найдена'}
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Вернуться на главную
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      {/* Board header */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Card.Title>{board.title}</Card.Title>
              {board.description && (
                <Card.Text className="text-muted">
                  {board.description}
                </Card.Text>
              )}
            </div>

            {/* Board menu */}
            <Dropdown show={showMenu} onToggle={(show) => setShowMenu(show)}>
              <Dropdown.Toggle variant="outline-secondary" id="board-menu">
                ⋮
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => {
                  setShowEditModal(true)
                  setShowMenu(false)
                }}>
                  Редактировать
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  className="text-danger"
                  onClick={() => {
                    setShowDeleteModal(true)
                    setShowMenu(false)
                  }}
                >
                  Удалить доску
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Body>
      </Card>

      {/* Columns */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="d-flex gap-3 overflow-auto pb-3">
          {columns.map(column => (
            <div key={column.id} style={{ minWidth: '300px', maxWidth: '300px' }}>
              <ColumnCard
                column={column}
                tasks={tasks[column.id] || []}
                onAddTask={() => handleAddTask(column.id)}
                onTaskDelete={handleDeleteTask}
                onEditColumn={() => handleEditColumn(column)}
              />
            </div>
          ))}
          
          {/* Add column button */}
          <div style={{ minWidth: '300px', maxWidth: '300px' }}>
            <Card className="h-100">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCreateColumnModal(true)}
                >
                  + Добавить колонку
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </DndContext>

      {/* Back button */}
      <Button
        variant="outline-secondary"
        className="mt-4"
        onClick={() => navigate('/')}
      >
        ← Назад к списку досок
      </Button>

      {/* Create column modal */}
      <CreateColumnModal
        show={showCreateColumnModal}
        onHide={() => setShowCreateColumnModal(false)}
        onCreate={createColumn}
      />

      {/* Create task modal */}
      <CreateTaskModal
        show={showCreateTaskModal}
        onHide={() => {
          setShowCreateTaskModal(false)
          setSelectedColumnId(null)
        }}
        onCreate={selectedColumnId ? (data) => createTask(selectedColumnId, data) : async () => {}}
      />

      {/* Edit board modal */}
      <EditBoardModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        board={board}
        onSuccess={handleEditSuccess}
      />

      {/* Delete board modal */}
      <DeleteBoardModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        board={board}
        onSuccess={handleDeleteSuccess}
      />

      {/* Delete task modal */}
      <DeleteConfirmModal
        show={showDeleteTaskModal}
        onHide={() => {
          setShowDeleteTaskModal(false)
          setSelectedTask(null)
        }}
        itemName={selectedTask?.title || ''}
        itemType="task"
        onDelete={handleDeleteTaskConfirm}
      />

      {/* Edit column modal */}
      <EditColumnModal
        show={showEditColumnModal}
        onHide={() => {
          setShowEditColumnModal(false)
          setSelectedColumn(null)
        }}
        column={selectedColumn}
        onUpdate={handleEditColumnSuccess}
      />
    </Container>
  )
}

export default BoardDetailPage
