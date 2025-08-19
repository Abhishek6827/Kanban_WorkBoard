import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, User, MoreVertical } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateTaskModal from '../components/CreateTaskModal';

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: board, isLoading } = useQuery(
    ['board', boardId],
    async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/boards/${boardId}/`);
      return response.data;
    }
  );

  const { data: users } = useQuery(
    'users',
    async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/`);
      return response.data;
    }
  );

  const updateTaskStatusMutation = useMutation(
    async ({ taskId, status }) => {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/status/`,
        { status }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['board', boardId]);
        toast.success('Task status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update task status');
      },
    }
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    updateTaskStatusMutation.mutate({ taskId: draggableId, status: newStatus });
  };

  const getTasksByStatus = (status) => {
    if (!board?.tasks) return [];
    return board.tasks.filter(task => task.status === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To-Do':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Board not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Boards</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
                <p className="text-sm text-gray-500">{board.description}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateTask(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['To-Do', 'In Progress', 'Completed'].map((status) => (
              <div key={status} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{status}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {getTasksByStatus(status).length}
                    </span>
                  </div>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {getTasksByStatus(status).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  {task.assignee && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <User className="w-4 h-4 mr-1" />
                                      <span>{task.assignee.username}</span>
                                    </div>
                                  )}
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          boardId={boardId}
          users={users}
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => {
            setShowCreateTask(false);
            queryClient.invalidateQueries(['board', boardId]);
          }}
        />
      )}
    </div>
  );
};

export default BoardDetail;