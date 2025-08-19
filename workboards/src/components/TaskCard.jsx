import React, { useState, useRef, useEffect } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2Icon, Trash2Icon, XIcon } from 'lucide-react'

const TaskCard = ({ task, index, onDelete, onUpdate, users }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false)
  const statusSelectRef = useRef(null)
  const assigneeSelectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusSelectRef.current && !statusSelectRef.current.contains(event.target)) {
        setStatusDropdownOpen(false)
      }
      if (assigneeSelectRef.current && !assigneeSelectRef.current.contains(event.target)) {
        setAssigneeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedTask(task)
  }

  const handleSave = () => {
    onUpdate(task.id, editedTask)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value) => {
    setEditedTask({ ...editedTask, status: value })
    setStatusDropdownOpen(false)
  }

  const handleAssigneeChange = (value) => {
    const assignee = users.find(user => user.id === value) || null
    setEditedTask({ ...editedTask, assignee })
    setAssigneeDropdownOpen(false)
  }

  const toggleStatusDropdown = (e) => {
    e.preventDefault()
    setStatusDropdownOpen(!statusDropdownOpen)
    setAssigneeDropdownOpen(false)
  }

  const toggleAssigneeDropdown = (e) => {
    e.preventDefault()
    setAssigneeDropdownOpen(!assigneeDropdownOpen)
    setStatusDropdownOpen(false)
  }

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 bg-purple-100 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
        >
          <CardContent className="p-4">
            {isEditing ? (
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <Input
                  name="title"
                  value={editedTask.title}
                  onChange={handleChange}
                  className="w-full"
                />
                <Textarea
                  name="description"
                  value={editedTask.description}
                  onChange={handleChange}
                  className="w-full"
                />
                <div className="relative" ref={statusSelectRef}>
                  <button
                    onClick={toggleStatusDropdown}
                    className="w-full p-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editedTask.status || "Select status"}
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {["To-Do", "In Progress", "Completed"].map((status) => (
                        <div
                          key={status}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSelectChange(status)}
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" ref={assigneeSelectRef}>
                  <button
                    onClick={toggleAssigneeDropdown}
                    className="w-full p-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editedTask.assignee?.username || "Assign to"}
                  </button>
                  {assigneeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleAssigneeChange(user.id)}
                        >
                          {user.username}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {task.status} • {task.assignee?.username || 'Unassigned'}
                  </span>
                  <div>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  )
}

export default TaskCard