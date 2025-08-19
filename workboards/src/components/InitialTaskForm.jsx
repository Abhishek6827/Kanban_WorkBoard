import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Check, X, Trash, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUsers } from '../api'

const InitialTaskForm = ({ onCreateBoard, boardName, boardDescription }) => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    status: 'To-Do'
  })
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [showAssigneeAndStatus, setShowAssigneeAndStatus] = useState(true)
  const [error, setError] = useState(null)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false)
  const [users, setUsers] = useState([])

  const statusOptions = ['To-Do', 'In Progress', 'Completed']

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

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setTasks(prevTasks => [...prevTasks, { ...newTask, id: Date.now() }])
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        status: 'To-Do'
      })
      setShowAssigneeAndStatus(true)
      setError(null)
    } else {
      setError('Task title is required')
    }
  }

  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId)
    setNewTask({ ...taskToEdit })
    setEditingTaskId(taskId)
    setShowAssigneeAndStatus(true)
    setError(null)
  }

  const handleSaveEdit = (taskId) => {
    if (newTask.title.trim()) {
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...newTask } : task
      ))
      setEditingTaskId(null)
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        status: 'To-Do'
      })
      setShowAssigneeAndStatus(true)
      setError(null)
    } else {
      setError('Task title is required')
    }
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      status: 'To-Do'
    })
    setShowAssigneeAndStatus(true)
    setError(null)
  }

  const handleDeleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
    setEditingTaskId(null)
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      status: 'To-Do'
    })
    setShowAssigneeAndStatus(true)
    setError(null)
  }

  const handleCreateBoard = () => {
    if (tasks.length === 0) {
      setError('Please add at least one task before creating the board')
    } else {
      onCreateBoard(tasks)
    }
  }

  useEffect(() => {
    if (tasks.length > 0) {
      setError(null)
    }
  }, [tasks])

  return (
    <Card className="mt-6">
      <CardContent className="p-6 space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{boardName}</h2>
          <p className="text-gray-600">{boardDescription}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="bg-purple-100 p-4 rounded-lg flex justify-between items-center">
            {editingTaskId === task.id ? (
              <>
                <div className="flex-grow mr-2">
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task Title"
                    className="mb-2"
                  />
                  <div className="relative mb-2">
                    <button
                      className="w-full p-2 text-left bg-white border rounded flex justify-between items-center"
                      onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                    >
                      {newTask.assignee ? users.find(user => user.id === newTask.assignee)?.username : 'Assign to'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAssigneeOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {isAssigneeOpen && (
                      <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setNewTask(prev => ({ ...prev, assignee: user.id }))
                              setIsAssigneeOpen(false)
                            }}
                          >
                            {user.username}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      className="w-full p-2 text-left bg-white border rounded flex justify-between items-center"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                    >
                      {newTask.status}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isStatusOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {isStatusOpen && (
                      <div className="absolute z-10 w-full bg-white border rounded mt-1">
                        {statusOptions.map((option) => (
                          <div
                            key={option}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setNewTask(prev => ({ ...prev, status: option }))
                              setIsStatusOpen(false)
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(task.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.status}</p>
                  {task.assignee && <p className="text-sm text-gray-500">Assigned to: {users.find(user => user.id === task.assignee)?.username}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}

        <Input
          value={newTask.title}
          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Task Title"
          className="w-full p-2 border rounded bg-white placeholder-gray-400"
        />
        <Textarea
          value={newTask.description}
          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Task Description (Optional)"
          className="w-full p-2 border rounded bg-white placeholder-gray-400"
          rows={3}
        />
        {showAssigneeAndStatus && (
          <>
            <div className="relative">
              <button
                className="w-full p-2 text-left bg-white border rounded flex justify-between items-center"
                onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
              >
                {newTask.assignee ? users.find(user => user.id === newTask.assignee)?.username : 'Assign to'}
                <ChevronDown className={`h-4 w-4 transition-transform ${isAssigneeOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {isAssigneeOpen && (
                <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setNewTask(prev => ({ ...prev, assignee: user.id }))
                        setIsAssigneeOpen(false)
                      }}
                    >
                      {user.username}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="w-full p-2 text-left bg-white border rounded flex justify-between items-center"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
              >
                {newTask.status}
                <ChevronDown className={`h-4 w-4 transition-transform ${isStatusOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {isStatusOpen && (
                <div className="absolute z-10 w-full bg-white border rounded mt-1">
                  {statusOptions.map((option) => (
                    <div
                      key={option}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setNewTask(prev => ({ ...prev, status: option }))
                        setIsStatusOpen(false)
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <Button 
          onClick={() => {
            handleAddTask();
            setShowAssigneeAndStatus(false);
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
        <Button 
          onClick={handleCreateBoard}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center"
        >
          Create Work Board
        </Button>
      </CardContent>
    </Card>
  )
}

export default InitialTaskForm