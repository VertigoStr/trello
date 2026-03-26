/**
 * Dashboard page - main page with board list.
 */

import React, { useState } from 'react'
import { Container, Button, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '@/hooks/useBoards'
import { BoardList } from '@/components/boards/BoardList'
import { CreateBoardModal } from '@/components/boards/CreateBoardModal'
import type { Board } from '@/types/board'

export function DashboardPage() {
  const navigate = useNavigate()
  const { boards, loading, error, createBoard } = useBoards()
  const [showCreateModal, setShowCreateModal] = useState(false)

  /**
   * Handle board click.
   */
  const handleBoardClick = (board: Board) => {
    navigate(`/board/${board.id}`)
  }

  /**
   * Handle create board.
   */
  const handleCreate = async (data: { title: string; description?: string }) => {
    return createBoard(data)
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

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Мои доски</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Создать доску
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="danger" onClose={() => {}} dismissible>
          {error}
        </Alert>
      )}

      {/* Board list */}
      <BoardList boards={boards} onBoardClick={handleBoardClick} />

      {/* Create board modal */}
      <CreateBoardModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />
    </Container>
  )
}

export default DashboardPage
