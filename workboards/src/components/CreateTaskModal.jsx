import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Calendar, User, Mail } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../api";

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
        `${API_URL}/tasks/`,
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
        `${API_URL}/tasks/${task.id}/`,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-md overflow-hidden animate-scale-in transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {task ? "Edit Task" : "Create New Task"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-50 mt-2 font-medium">
            {task ? "Update your task details" : "Add a new task to your board"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50/30">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 shadow-soft"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 shadow-soft resize-none"
              placeholder="Describe the task..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 shadow-soft"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Assignee Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign to User (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                name="assignee_email"
                value={formData.assignee_email}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 shadow-soft"
                placeholder="Enter user's email"
                list="user-emails"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
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
            <p className="text-xs text-gray-500 mt-2 px-1">
              Enter the email of the user you want to assign this task to
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 shadow-soft"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold transform hover:scale-[1.02] active:scale-95 shadow-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createTaskMutation.isPending || updateTaskMutation.isPending
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold transform hover:scale-[1.02] active:scale-95 shadow-medium hover:shadow-large"
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
