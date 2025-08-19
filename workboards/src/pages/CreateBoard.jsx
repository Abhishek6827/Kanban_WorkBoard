import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Plus, X, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateBoard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [tasks, setTasks] = useState([
    {
      title: '',
      description: '',
      assignee: '',
      status: 'To-Do',
    },
  ]);

  const { data: users } = useQuery(
    'users',
    async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/`);
      return response.data;
    }
  );

  const createBoardMutation = useMutation(
    async (data) => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/boards/`, data);
      return response.data;
    },
    {
      onSuccess: (board) => {
        queryClient.invalidateQueries('boards');
        toast.success('Work Board created successfully!');
        navigate(`/boards/${board.id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create board');
      },
    }
  );

  const createTaskMutation = useMutation(
    async (taskData) => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tasks/`, taskData);
      return response.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create task');
      },
    }
  );

  const handleBoardChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        title: '',
        description: '',
        assignee: '',
        status: 'To-Do',
      },
    ]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Board title is required');
      return;
    }

    const validTasks = tasks.filter(task => task.title.trim());
    if (validTasks.length === 0) {
      toast.error('At least one task is required');
      return;
    }

    try {
      // Create board first
      const board = await createBoardMutation.mutateAsync(formData);

      // Create tasks for the board
      const taskPromises = validTasks.map(task =>
        createTaskMutation.mutateAsync({
          ...task,
          board: board.id,
          assignee_id: task.assignee || null,
        })
      );

      await Promise.all(taskPromises);
      
      queryClient.invalidateQueries(['board', board.id]);
      toast.success('Work Board and tasks created successfully!');
      navigate(`/boards/${board.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Boards</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create Work Board</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Board Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Board Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Title of Work Board *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter board title"
                  value={formData.name}
                  onChange={handleBoardChange}
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
                  placeholder="Enter board description (optional)"
                  value={formData.description}
                  onChange={handleBoardChange}
                />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <button
                type="button"
                onClick={addTask}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>

            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Task {index + 1}</h3>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title of the Task *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter task title"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to a User
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={task.assignee}
                        onChange={(e) => handleTaskChange(index, 'assignee', e.target.value)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={task.status}
                        onChange={(e) => handleTaskChange(index, 'status', e.target.value)}
                      >
                        <option value="To-Do">To-Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description of the Task
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter task description (optional)"
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBoardMutation.isLoading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBoardMutation.isLoading ? 'Creating...' : 'Create Work Board'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateBoard;