import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, X } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getBoard, getTasks, updateTask, createTask, deleteTask, getUsers } from '../api'
import { useAuth } from '../contexts/AuthContext'
import TaskCard from '../components/TaskCard'

const StrictModeDroppable = React.memo(({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
});

const Column = React.memo(({ column, tasks, onAddTask, onDeleteTask, onUpdateTask, users }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.status, newTaskTitle);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <div className={`flex-1 p-4 rounded-lg ${column.bgColor}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">{column.title}</h2>
      </div>
      <StrictModeDroppable droppableId={column.status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`min-h-[200px] ${snapshot.isDraggingOver ? 'bg-gray-100 bg-opacity-50' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                onDelete={onDeleteTask} 
                onUpdate={onUpdateTask}
                users={users}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
      {isAddingTask ? (
        <div className="mt-2">
          <Input
            type="text"
            placeholder="Enter task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="mb-2"
          />
          <div className="flex justify-end space-x-2">
            <Button size="sm" onClick={handleAddTask}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => setIsAddingTask(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      )}
    </div>
  )
})

export default function WorkBoardPage() {
  const [board, setBoard] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { boardId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const fetchBoardData = useCallback(async () => {
    if (!boardId) {
      setError('Board ID is missing')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let boardData, tasksData, usersData

      if (location.state?.board && location.state?.tasks) {
        boardData = location.state.board
        tasksData = location.state.tasks
        usersData = await getUsers()
      } else {
        const fetchBoard = getBoard(boardId).catch(err => {
          console.error('Error fetching board:', err)
          throw new Error(`Failed to fetch board data: ${err.message}`)
        })
        const fetchTasks = getTasks(boardId).catch(err => {
          console.error('Error fetching tasks:', err)
          throw new Error(`Failed to fetch tasks data: ${err.message}`)
        })
        const fetchUsers = getUsers().catch(err => {
          console.error('Error fetching users:', err)
          throw new Error(`Failed to fetch users data: ${err.message}`)
        })

        [boardData, tasksData, usersData] = await Promise.all([fetchBoard, fetchTasks, fetchUsers])
      }

      setBoard(boardData)
      setTasks(tasksData.map(task => ({ ...task, id: String(task.id) })))
      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching board data:', err)
      let errorMessage = 'Failed to fetch board data. Please try again later.'
      if (err.response) {
        console.error('Error response:', err.response.data)
        errorMessage += ` Server responded with: ${err.response.status} ${err.response.statusText}`
      } else if (err.request) {
        console.error('No response received:', err.request)
        errorMessage += ' No response received from the server.'
      } else {
        console.error('Error details:', err.message)
        errorMessage += ` Error: ${err.message}`
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [boardId, location.state])

  useEffect(() => {
    fetchBoardData()
  }, [fetchBoardData])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setError('Logout failed. Please try again.')
    }
  }, [logout, navigate])

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const updatedTasks = Array.from(tasks)
    const [reorderedTask] = updatedTasks.splice(source.index, 1)
    updatedTasks.splice(destination.index, 0, reorderedTask)

    const updatedTask = { 
      ...reorderedTask, 
      status: destination.droppableId,
      assignee_id: reorderedTask.assignee ? reorderedTask.assignee.id : null,
      board: boardId
    }
    setTasks(updatedTasks.map(task => task.id === updatedTask.id ? updatedTask : task))

    try {
      await updateTask(draggableId, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        assignee_id: updatedTask.assignee_id,
        board: updatedTask.board
      })
    } catch (error) {
      console.error('Failed to update task:', error)
      setError('Failed to update task. Please try again.')
      setTasks(tasks)
    }
  }, [tasks, boardId])

  const handleAddTask = useCallback(async (status, title) => {
    try {
      const newTask = await createTask(boardId, { title, status, board: boardId })
      setTasks(prevTasks => [...prevTasks, { ...newTask, id: String(newTask.id) }])
    } catch (error) {
      console.error('Failed to create task:', error)
      setError('Failed to create task. Please try again.')
    }
  }, [boardId])

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== String(taskId)))
    } catch (error) {
      console.error('Failed to delete task:', error)
      setError('Failed to delete task. Please try again.')
    }
  }, [])

  const handleUpdateTask = useCallback(async (taskId, updatedData) => {
    try {
      const updatedTask = await updateTask(taskId, { 
        ...updatedData, 
        board: boardId,
        assignee_id: updatedData.assignee ? updatedData.assignee.id : null
      });
      setTasks(prevTasks => prevTasks.map(task => task.id === String(taskId) ? { ...task, ...updatedTask, id: String(updatedTask.id) } : task));
    } catch (error) {
      console.error('Failed to update task:', error);
      setError(error.response?.data?.detail || 'Failed to update task. Please try again.');
    }
  }, [boardId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/boards')}>
          Go back to Boards
        </Button>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Alert variant="warning" className="max-w-md mb-4">
          <AlertDescription>The requested board could not be found.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/boards')}>
          Go back to Boards
        </Button>
      </div>
    )
  }

  const columns = [
    { title: "To-Do's", status: 'To-Do', bgColor: 'bg-gray-200' },
    { title: 'In Progress', status: 'In Progress', bgColor: 'bg-blue-100' },
    { title: 'Completed', status: 'Completed', bgColor: 'bg-green-100' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-gray-500">My Workboards /</div>
          <h1 className="text-2xl font-bold text-blue-700">{board.name}</h1>
          <p className="text-sm text-gray-600">{board.description}</p>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {columns.map((column) => (
            <Column 
              key={column.status} 
              column={column} 
              tasks={tasks.filter(task => task.status === column.status)} 
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              users={users}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}