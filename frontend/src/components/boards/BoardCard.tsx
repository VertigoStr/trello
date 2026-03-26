/**
 * Board card component for displaying a board in the list.
 */

import React from 'react'
import { Card } from 'react-bootstrap'
import type { Board } from '@/types/board'

interface BoardCardProps {
  board: Board
  onClick: (board: Board) => void
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  return (
    <Card
      className="h-100 cursor-pointer hover-shadow"
      onClick={() => onClick(board)}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <Card.Title className="mb-2">{board.title}</Card.Title>
        {board.description && (
          <Card.Text className="text-muted mb-0">
            {board.description.length > 100
              ? `${board.description.substring(0, 100)}...`
              : board.description}
          </Card.Text>
        )}
      </Card.Body>
      <Card.Footer className="bg-transparent">
        <small className="text-muted">
          Обновлено: {new Date(board.updatedAt).toLocaleDateString('ru-RU')}
        </small>
      </Card.Footer>
    </Card>
  )
}
