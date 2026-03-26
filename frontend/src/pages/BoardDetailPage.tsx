/**
 * Board detail page - view board with columns and tasks.
 */

import React, { useEffect, useState } from 'react'
import { Container, Spinner, Alert, Button, Card } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { boardService } from '@/services/boardService'
import type { Board } from '@/types/board'

export function BoardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch board details.
   */
  useEffect(() => {
    const fetchBoard = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await boardService.getById(id)
        setBoard(data)
        setError(null)
      } catch (err) {
        if ((err as any).error?.code === 'ACCESS_DENIED') {
          setError('У вас нет доступа к этой доске')
        } else if ((err as any).error?.code === 'BOARD_NOT_FOUND') {
          setError('Доска не найдена')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load board')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBoard()
  }, [id])

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
          <Card.Title>{board.title}</Card.Title>
          {board.description && (
            <Card.Text className="text-muted">
              {board.description}
            </Card.Text>
          )}
        </Card.Body>
      </Card>

      {/* Placeholder for columns/tasks */}
      <Card>
        <Card.Body className="text-center py-5">
          <h4 className="text-muted mb-3">Колонки и задачи</h4>
          <p className="text-muted mb-0">
            Функционал управления колонками и задачами будет добавлен в следующем обновлении.
          </p>
        </Card.Body>
      </Card>

      {/* Back button */}
      <Button
        variant="outline-secondary"
        className="mt-4"
        onClick={() => navigate('/')}
      >
        ← Назад к списку досок
      </Button>
    </Container>
  )
}
