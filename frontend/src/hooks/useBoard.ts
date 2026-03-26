/**
 * Custom hook for managing board state with columns and tasks.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { boardService } from '@/services/boardService'
import { columnService } from '@/services/columnService'
import { taskService } from '@/services/taskService'
import type { Board } from '@/types/board'
import type { Column, CreateColumnDTO, UpdateColumnDTO } from '@/types/column'
import type { Task, CreateTaskDTO, UpdateTaskDTO, MoveTaskDTO } from '@/types/task'

/**
 * Hook return type.
 */
interface UseBoardReturn {
  board: Board | null
  columns: Column[]
  tasks: Record<string, Task[]> // columnId -> tasks
  loading: boolean
  error: string | null
  // Column operations
  createColumn: (data: CreateColumnDTO) => Promise<Column>
  updateColumn: (id: string, data: UpdateColumnDTO) => Promise<Column>
  deleteColumn: (id: string) => Promise<void>
  // Task operations
  createTask: (columnId: string, data: CreateTaskDTO) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskDTO) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, data: MoveTaskDTO) => Promise<void>
  // Utility
  refetch: () => Promise<void>
}

/**
 * Polling interval in milliseconds (30 seconds).
 */
const POLLING_INTERVAL = 30000

/**
 * Custom hook for managing board state and operations with auto-refresh.
 */
export function useBoard(boardId: string): UseBoardReturn {
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Ref to track if we should poll (component mounted)
  const shouldPollRef = useRef(true)

  /**
   * Fetch board data.
   */
  const fetchBoard = useCallback(async () => {
    try {
      const [boardData, columnsData, tasksData] = await Promise.all([
        boardService.getById(boardId),
        columnService.getByBoard(boardId),
        taskService.getByBoard(boardId),
      ])
      setBoard(boardData)
      setColumns(columnsData)
      
      // Group tasks by column
      const tasksByColumn: Record<string, Task[]> = {}
      tasksData.forEach((task: Task) => {
        if (!tasksByColumn[task.columnId]) {
          tasksByColumn[task.columnId] = []
        }
        tasksByColumn[task.columnId].push(task)
      })
      setTasks(tasksByColumn)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board')
    } finally {
      setLoading(false)
    }
  }, [boardId])

  /**
   * Create a new column.
   */
  const createColumn = useCallback(async (data: CreateColumnDTO): Promise<Column> => {
    const column = await columnService.create(boardId, data)
    setColumns(prev => [...prev, column])
    return column
  }, [boardId])

  /**
   * Update a column.
   */
  const updateColumn = useCallback(async (id: string, data: UpdateColumnDTO): Promise<Column> => {
    const updatedColumn = await columnService.update(id, data)
    setColumns(prev => prev.map(col => col.id === id ? updatedColumn : col))
    return updatedColumn
  }, [])

  /**
   * Delete a column.
   */
  const deleteColumn = useCallback(async (id: string): Promise<void> => {
    await columnService.delete(id)
    setColumns(prev => prev.filter(col => col.id !== id))
    // Also remove tasks from deleted column
    setTasks(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }, [])

  /**
   * Create a new task.
   */
  const createTask = useCallback(async (columnId: string, data: CreateTaskDTO): Promise<Task> => {
    const task = await taskService.create(columnId, data)
    setTasks(prev => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), task],
    }))
    return task
  }, [])

  /**
   * Update a task.
   */
  const updateTask = useCallback(async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    const updatedTask = await taskService.update(id, data)
    // Find which column the task belongs to
    setTasks(prev => {
      const updated = { ...prev }
      for (const columnId of Object.keys(updated)) {
        updated[columnId] = updated[columnId].map(task =>
          task.id === id ? updatedTask : task
        )
      }
      return updated
    })
    return updatedTask
  }, [])

  /**
   * Delete a task.
   */
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await taskService.delete(id)
    setTasks(prev => {
      const updated = { ...prev }
      for (const columnId of Object.keys(updated)) {
        updated[columnId] = updated[columnId].filter(task => task.id !== id)
      }
      return updated
    })
  }, [])

  /**
   * Move a task to a new column/position with optimistic update and rollback.
   */
  const moveTask = useCallback(async (id: string, data: MoveTaskDTO): Promise<void> => {
    // Find current task and column
    let currentColumnId = ''
    let currentTask: Task | undefined
    for (const [columnId, columnTasks] of Object.entries(tasks)) {
      const task = columnTasks.find(t => t.id === id)
      if (task) {
        currentColumnId = columnId
        currentTask = task
        break
      }
    }

    if (!currentTask || !currentColumnId) {
      throw new Error('Task not found')
    }

    // Optimistic update
    setTasks(prev => {
      const updated = { ...prev }
      // Remove from old column
      updated[currentColumnId] = updated[currentColumnId].filter(t => t.id !== id)
      // Add to new column
      if (!updated[data.columnId]) {
        updated[data.columnId] = []
      }
      updated[data.columnId].push({ ...currentTask, columnId: data.columnId, position: data.position })
      return updated
    })

    try {
      await taskService.move(id, data)
    } catch (err) {
      // Rollback on error
      setTasks(prev => {
        const updated = { ...prev }
        // Remove from new column
        updated[data.columnId] = updated[data.columnId].filter(t => t.id !== id)
        // Add back to old column
        updated[currentColumnId] = [...updated[currentColumnId], currentTask]
        return updated
      })
      throw err
    }
  }, [tasks])

  /**
   * Load board on mount and setup polling.
   */
  useEffect(() => {
    shouldPollRef.current = true
    fetchBoard()

    // Setup polling interval
    const intervalId = setInterval(() => {
      if (shouldPollRef.current) {
        fetchBoard()
      }
    }, POLLING_INTERVAL)

    // Cleanup
    return () => {
      shouldPollRef.current = false
      clearInterval(intervalId)
    }
  }, [fetchBoard])

  return {
    board,
    columns,
    tasks,
    loading,
    error,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch: fetchBoard,
  }
}
