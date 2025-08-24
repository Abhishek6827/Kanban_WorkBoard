// src/components/InlineTaskForm.jsx
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const InlineTaskForm = ({
  boardId,
  onCreateTask,
  onCancel,
  defaultStatus = "To-Do",
}) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: defaultStatus,
    assignee_email: "",
    board: boardId, // Make sure board ID is included
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) {
      alert("Task title is required");
      return;
    }

    console.log("Submitting task:", taskData);
    onCreateTask(taskData);
  };

  const handleChange = (field, value) => {
    setTaskData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-4 mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Task title *"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          autoFocus
        />

        <textarea
          value={taskData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={taskData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Assignee Email
            </label>
            <input
              type="email"
              value={taskData.assignee_email}
              onChange={(e) => handleChange("assignee_email", e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Task
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
