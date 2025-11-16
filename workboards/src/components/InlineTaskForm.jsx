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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-400 rounded-2xl p-5 mb-4 animate-scale-in shadow-soft">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Task title *"
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-soft font-medium"
          required
          autoFocus
        />

        <textarea
          value={taskData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 resize-none shadow-soft"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={taskData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-soft text-sm font-medium"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Assignee Email
            </label>
            <input
              type="email"
              value={taskData.assignee_email}
              onChange={(e) => handleChange("assignee_email", e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-soft text-sm"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold transform hover:scale-[1.02] active:scale-95 shadow-medium hover:shadow-large flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-soft flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
