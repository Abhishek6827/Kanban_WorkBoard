import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBoard, createTask, getUsers, getTasks } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from 'lucide-react'
import WorkBoardInfo from '@/components/WorkBoardInfo'
import InitialTaskForm from '@/components/InitialTaskForm'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CreateBoardPage() {
  const [step, setStep] = useState(1)
  const [boardName, setBoardName] = useState("")
  const [boardDescription, setBoardDescription] = useState("")
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const { user, logout, assignedBoards, assignments, updateUserData } = useAuth()
  const [boards, setBoards] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError('Failed to fetch users. Please try again.')
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchBoards = async () => {
      setIsLoading(true)
      try {
        const boardsData = await Promise.all(
          assignedBoards.map(async (board) => {
            const tasks = await getTasks(board.id)
            return { ...board, tasks }
          })
        )
        setBoards(boardsData)
        setError(null)
      } catch (err) {
        console.error('Error fetching boards:', err)
        setError('Failed to load assigned boards. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    if (user && assignedBoards.length > 0) {
      fetchBoards()
    } else {
      setIsLoading(false)
    }
  }, [user, assignedBoards])

  useEffect(() => {
    updateUserData()
  }, [updateUserData])

  const handleCreateBoard = useCallback(async (tasksToCreate) => {
    if (tasksToCreate.length === 0) {
      setError('Please add at least one task before creating the board')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log('Creating board with:', { name: boardName, description: boardDescription })
      const newBoard = await createBoard({
        name: boardName,
        description: boardDescription,
      })
      console.log('Board created:', newBoard)

      if (!newBoard || !newBoard.id) {
        throw new Error('Failed to create board: Invalid response from server')
      }

      const createdTasks = []
      for (const task of tasksToCreate) {
        try {
          console.log(`Attempting to create task for board ${newBoard.id}:`, task)
          const createdTask = await createTask(newBoard.id, {
            title: task.title,
            description: task.description,
            status: task.status,
            assignee_id: task.assignee
          })
          console.log('Task created successfully:', createdTask)
          createdTasks.push(createdTask)
        } catch (taskError) {
          console.error('Error creating task:', taskError)
          console.error('Full error object:', taskError)
          if (taskError.response) {
            console.error('Error response:', taskError.response.data)
            console.error('Error status:', taskError.response.status)
          }
          createdTasks.push({ error: `Failed to create task: ${taskError.message}` })
        }
      }

      console.log('All tasks creation attempts completed:', createdTasks)
      
      const successfulTasks = createdTasks.filter(task => !task.error)
      if (successfulTasks.length > 0) {
        console.log('Navigating to:', `/board/${newBoard.id}`)
        navigate(`/board/${newBoard.id}`, { 
          state: { 
            board: newBoard, 
            tasks: successfulTasks 
          } 
        })
      } else {
        throw new Error('Failed to create any tasks')
      }
    } catch (error) {
      console.error('Error creating board or tasks:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      setError(`Failed to create board or tasks: ${error.message}. Please try again or contact support if the problem persists.`)
    } finally {
      setIsLoading(false)
    }
  }, [boardName, boardDescription, navigate])

  const handleAddTask = useCallback((task) => {
    setTasks(prevTasks => [...prevTasks, task])
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setError('Logout failed. Please try again.')
    }
  }, [logout, navigate])

  const handleNextStep = useCallback(() => {
    if (boardName.trim() === '') {
      setError('Board name is required')
      return
    }
    setError(null)
    setStep(2)
  }, [boardName])

  const handleUpdateTasks = useCallback((updatedTasks) => {
    setTasks(updatedTasks)
  }, [])

  const renderAssignedBoards = () => {
    if (boards.length === 0) {
      return <p>No assigned boards found.</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {boards.map((board) => (
          <Card key={board.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{board.name}</h2>
            <p className="text-gray-600 mb-4">{board.description}</p>
            <h3 className="text-lg font-medium mb-2">Tasks:</h3>
            <ul className="list-disc list-inside">
              {board.tasks.map((task) => (
                <li key={task.id} className="mb-1">
                  {task.title} - {task.status}
                </li>
              ))}
            </ul>
            <Link
              to={`/board/${board.id}`}
              className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              View Board
            </Link>
          </Card>
        ))}
      </div>
    )
  }

  const renderAssignments = () => {
    if (assignments.length === 0) {
      return <p>No assignments found.</p>
    }

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
        <ul className="space-y-2">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="bg-white shadow-sm rounded-lg p-4">
              <h3 className="text-lg font-medium">{assignment.title}</h3>
              <p className="text-gray-600">{assignment.description}</p>
              <p className="text-sm text-gray-500 mt-2">Status: {assignment.status}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">WorkBoard Dashboard</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold">Loading...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Create a New WorkBoard</h2>
              {step === 1 ? (
                <WorkBoardInfo 
                  boardName={boardName}
                  boardDescription={boardDescription}
                  onBoardNameChange={setBoardName}
                  onBoardDescriptionChange={setBoardDescription}
                  onSubmit={handleNextStep}
                />
              ) : (
                <InitialTaskForm 
                  onAddTask={handleAddTask}
                  tasks={tasks}
                  onUpdateTasks={handleUpdateTasks}
                  onCreateBoard={handleCreateBoard}
                  boardName={boardName}
                  boardDescription={boardDescription}
                  users={users}
                />
              )}
              <h2 className="text-xl font-semibold mt-8 mb-4">Your Assigned Boards</h2>
              {renderAssignedBoards()}
              {renderAssignments()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}