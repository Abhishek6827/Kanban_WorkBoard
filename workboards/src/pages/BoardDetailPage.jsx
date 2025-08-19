import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, deleteBoard, createTask, updateTask, deleteTask } from '../api';
import { Trash2, Plus, X, Edit2, Check, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/textarea";

const BoardDetailPage = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const data = await getBoard(id);
        setBoard(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Failed to fetch board details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        setActionLoading(true);
        await deleteBoard(id);
        navigate('/boards');
      } catch (err) {
        setError('Failed to delete board. Please try again.');
        console.error('Error deleting board:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setActionLoading(true);
      const newTask = await createTask(id, {
        title: newTaskTitle,
        description: newTaskDescription,
      });
      setBoard({ ...board, tasks: [...board.tasks, newTask] });
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTask = async (taskId) => {
    if (!editingTaskTitle.trim()) return;

    try {
      setActionLoading(true);
      const updatedTask = await updateTask(taskId, { 
        title: editingTaskTitle,
        description: editingTaskDescription,
        board: id
      });
      setBoard({
        ...board,
        tasks: board.tasks.map(task => task.id === taskId ? updatedTask : task)
      });
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await deleteTask(taskId);
        setBoard({
          ...board,
          tasks: board.tasks.filter(task => task.id !== taskId)
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <Button
          onClick={() => navigate('/boards')}
          className="mt-4"
          variant="destructive"
        >
          Go back to Boards
        </Button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p>Board not found.</p>
        <Button
          onClick={() => navigate('/boards')}
          className="mt-4"
          variant="secondary"
        >
          Go back to Boards
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{board.name}</h1>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              variant="destructive"
              className="hover:bg-red-600 transition-colors duration-200"
            >
              {actionLoading ? (
                <Loader className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5 mr-2" />
              )}
              Delete Board
            </Button>
          </div>
          <p className="text-gray-600 mb-4">{board.description}</p>
          <div className="text-sm text-gray-500 mb-4">
            Created: {new Date(board.created_at).toLocaleString()}
          </div>
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          <form onSubmit={handleCreateTask} className="mb-4">
            <div className="space-y-2">
              <Input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task title"
                disabled={actionLoading}
                className="w-full"
              />
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task description"
                disabled={actionLoading}
                className="w-full"
              />
              <Button
                type="submit"
                disabled={actionLoading}
                className="w-full hover:bg-blue-600 transition-colors duration-200"
              >
                {actionLoading ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                Add Task
              </Button>
            </div>
          </form>
          {board.tasks && board.tasks.length > 0 ? (
            <ul className="space-y-4">
              {board.tasks.map((task) => (
                <li key={task.id} className="bg-gray-100 p-4 rounded hover:shadow-md transition-shadow duration-200">
                  {editingTaskId === task.id ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={editingTaskTitle}
                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                        className="w-full"
                      />
                      <Textarea
                        value={editingTaskDescription}
                        onChange={(e) => setEditingTaskDescription(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => handleUpdateTask(task.id)}
                          disabled={actionLoading}
                          size="sm"
                          className="hover:bg-green-600 transition-colors duration-200"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingTaskId(null)}
                          disabled={actionLoading}
                          size="sm"
                          variant="outline"
                          className="hover:bg-gray-200 transition-colors duration-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setEditingTaskTitle(task.title);
                              setEditingTaskDescription(task.description);
                            }}
                            disabled={actionLoading}
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-100 transition-colors duration-200"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={actionLoading}
                            size="sm"
                            variant="destructive"
                            className="hover:bg-red-600 transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">{task.description}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks found for this board.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardDetailPage;