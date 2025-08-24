import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Calendar, User, Mail } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateTaskModal = ({ boardId, users, task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To-Do",
    assignee_email: "",
    due_date: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "To-Do",
        assignee_email: task.assignee?.email || "",
        due_date: task.due_date || "",
      });
    }
  }, [task]);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks/`,
        taskData
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${task.id}/`,
        taskData
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Task updated successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update task");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      board: boardId,
      assignee_email: formData.assignee_email || null,
      due_date: formData.due_date || null,
    };

    if (task) {
      updateTaskMutation.mutate(taskData);
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {task ? "Edit Task" : "Create New Task"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            {task ? "Update your task details" : "Add a new task to your board"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the task..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Assignee Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to User (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                name="assignee_email"
                value={formData.assignee_email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter user's email"
                list="user-emails"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <datalist id="user-emails">
              {users?.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.username}
                </option>
              ))}
            </datalist>
            <p className="text-xs text-gray-500 mt-1">
              Enter the email of the user you want to assign this task to
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createTaskMutation.isPending || updateTaskMutation.isPending
              }
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createTaskMutation.isPending || updateTaskMutation.isPending
                ? "Saving..."
                : task
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
