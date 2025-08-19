import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ boardId, users, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    status: 'To-Do',
  });

  const createTaskMutation = useMutation(
    async (data) => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tasks/`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Task created successfully!');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create task');
      },
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        ...formData,
        board: boardId,
        assignee_id: formData.assignee || null,
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description (optional)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
              Assign to User
            </label>
            <select
              id="assignee"
              name="assignee"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.assignee}
              onChange={handleChange}
            >
              <option value="">Select a user</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTaskMutation.isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;