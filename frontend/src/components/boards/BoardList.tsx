/**
 * Board list component for displaying all boards.
 */

import React from 'react'
import { Row, Col } from 'react-bootstrap'
import { BoardCard } from './BoardCard'
import type { Board } from '@/types/board'

interface BoardListProps {
  boards: Board[]
  onBoardClick: (board: Board) => void
}

export function BoardList({ boards, onBoardClick }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-5">
        <h3 className="text-muted mb-3">У вас пока нет досок</h3>
        <p className="text-muted">Создайте свою первую доску!</p>
      </div>
    )
  }

  return (
    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
      {boards.map(board => (
        <Col key={board.id}>
          <BoardCard board={board} onClick={onBoardClick} />
        </Col>
      ))}
    </Row>
  )
}
