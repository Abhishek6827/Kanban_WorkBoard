import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddTasksForm({ tasks, setTasks, onSubmit, onPrevious, isLoading }) {
  const [newTask, setNewTask] = useState({ title: '', description: '' })

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now().toString() }])
      setNewTask({ title: '', description: '' })
    }
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="mb-4 bg-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{task.description}</p>
          </CardContent>
        </Card>
      ))}
      <Input
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        placeholder="Task Title"
        className="w-full p-2 border rounded bg-gray-100 placeholder-gray-400"
      />
      <Textarea
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        placeholder="Task Description (Optional)"
        className="w-full p-2 border rounded bg-gray-100 placeholder-gray-400"
        rows={3}
      />
      <Button 
        type="button"
        onClick={handleAddTask}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center"
      >
        Add Task
      </Button>
      <div className="flex justify-between">
        <Button 
          type="button"
          onClick={onPrevious}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
        >
          Back
        </Button>
        <Button 
          type="submit"
          onClick={onSubmit}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Work Board'}
        </Button>
      </div>
    </div>
  )
}