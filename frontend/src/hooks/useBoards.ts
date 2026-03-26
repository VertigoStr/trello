/**
 * Custom hook for managing boards state.
 */

import { useState, useEffect, useCallback } from 'react'
import { boardService } from '@/services/boardService'
import type { Board, CreateBoardDTO, UpdateBoardDTO } from '@/types/board'

/**
 * Hook return type.
 */
interface UseBoardsReturn {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
  createBoard: (data: CreateBoardDTO) => Promise<Board>
  updateBoard: (id: string, data: UpdateBoardDTO) => Promise<Board>
  deleteBoard: (id: string) => Promise<void>
  setCurrentBoard: (board: Board | null) => void
  refetch: () => Promise<void>
}

/**
 * Custom hook for managing boards state and operations.
 */
export function useBoards(): UseBoardsReturn {
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all boards.
   */
  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true)
      const data = await boardService.getAll()
      setBoards(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new board.
   */
  const createBoard = useCallback(async (data: CreateBoardDTO): Promise<Board> => {
    const board = await boardService.create(data)
    setBoards(prev => [...prev, board])
    return board
  }, [])

  /**
   * Update a board.
   */
  const updateBoard = useCallback(async (id: string, data: UpdateBoardDTO): Promise<Board> => {
    const updatedBoard = await boardService.update(id, data)
    setBoards(prev => prev.map(board => 
      board.id === id ? updatedBoard : board
    ))
    if (currentBoard?.id === id) {
      setCurrentBoard(updatedBoard)
    }
    return updatedBoard
  }, [currentBoard])

  /**
   * Delete a board.
   */
  const deleteBoard = useCallback(async (id: string): Promise<void> => {
    await boardService.delete(id)
    setBoards(prev => prev.filter(board => board.id !== id))
    if (currentBoard?.id === id) {
      setCurrentBoard(null)
    }
  }, [currentBoard])

  /**
   * Load boards on mount.
   */
  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  return {
    boards,
    currentBoard,
    loading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    refetch: fetchBoards,
  }
}
