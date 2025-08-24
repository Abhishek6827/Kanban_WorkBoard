// src/pages/BoardDetail.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAuth } from "../contexts/AuthContext";
import { BoardHeader } from "../components/BoardHeader";
import { StatusColumn } from "../components/StatusColumn";

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: board, isLoading } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/boards/${boardId}/`
      );
      return response.data;
    },
  });

  // Debug: Check what data is being received
  console.log("Board data:", board);

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task moved successfully!");
    },
    onError: (error) => {
      console.error("Error moving task:", error);
      toast.error(error.response?.data?.error || "Failed to move task");
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      console.log("Creating task with data:", taskData);

      // Prepare the data in the correct format for the API
      const payload = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        board: parseInt(taskData.board),
        assignee_email: taskData.assignee_email || null,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      console.error("Error creating task:", error.response?.data);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.assignee_email ||
          "Failed to create task"
      );
    },
  });

  // src/pages/BoardDetail.jsx - Add this mutation
  const updateBoardMutation = useMutation({
    mutationFn: async (boardData) => {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/boards/${boardId}/`,
        boardData
      );
      return response.data;
    },
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(["board", boardId], updatedBoard);
      toast.success("Board updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating board:", error);
      toast.error(error.response?.data?.error || "Failed to update board");
    },
  });

  // Add this function
  const handleUpdateBoard = (boardData) => {
    updateBoardMutation.mutate(boardData);
  };

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      // Prepare data for API - include the board ID
      const payload = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        assignee_email: taskData.assignee_email || null,
        board: taskData.board || boardId, // Include board ID from the task data or current board
      };

      console.log("Updating task with payload:", payload);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${taskData.id}/`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating task:", error.response?.data);

      // Handle different error response structures
      if (error.response?.data?.assignee_email) {
        // Specific error for assignee_email
        toast.error(`Assignee error: ${error.response.data.assignee_email}`);
      } else if (error.response?.data?.error) {
        // Generic error message
        toast.error(error.response.data.error);
      } else if (error.response?.data?.detail) {
        // Another common error format
        toast.error(error.response.data.detail);
      } else if (typeof error.response?.data === "string") {
        // String error response
        toast.error(error.response.data);
      } else {
        // Fallback error message
        toast.error("Failed to update task");
      }
    },
  });
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.error || "Failed to delete task");
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`${import.meta.env.VITE_API_URL}/boards/${boardId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted successfully!");
      navigate("/");
    },
    onError: (error) => {
      console.error("Error deleting board:", error);
      toast.error(error.response?.data?.error || "Failed to delete board");
    },
  });

  const handleDragStart = (event) => {
    const { active } = event;
    const activeTask = board?.tasks?.find((task) => task.id === active.id);
    setActiveTask(activeTask);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const activeTask = board?.tasks?.find((task) => task.id === activeId);
    if (!activeTask) return;

    if (over.data.current?.type === "status") {
      const newStatus = over.data.current.status;
      if (newStatus !== activeTask.status) {
        updateTaskStatusMutation.mutate({
          taskId: activeId,
          status: newStatus,
        });
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleUpdateTask = (taskData) => {
    updateTaskMutation.mutate(taskData);
  };

  const handleCreateTask = (taskData) => {
    console.log("Handling task creation:", taskData);
    createTaskMutation.mutate(taskData);
  };

  const handleDeleteBoard = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this board? All tasks will be permanently deleted."
      )
    ) {
      deleteBoardMutation.mutate();
    }
  };

  const getTasksByStatus = (status) =>
    board?.tasks?.filter((task) => task.status === status) || [];

  const canDeleteBoard = user && board?.owner && user.id === board.owner.id;
  const canEditTask = (task) =>
    user && (user.id === task.created_by?.id || user.id === board?.owner?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Board Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The board you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Boards
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BoardHeader
        board={board}
        onBack={() => navigate("/")}
        onDeleteBoard={handleDeleteBoard}
        onUpdateBoard={handleUpdateBoard} // Add this prop
        canDelete={canDeleteBoard}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {["To-Do", "In Progress", "Completed"].map((status) => (
              <StatusColumn
                key={status}
                status={status}
                tasks={getTasksByStatus(status)}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                onCreateTask={handleCreateTask}
                canEdit={canEditTask}
                boardId={boardId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl">
                <h4 className="font-semibold text-gray-900">
                  {activeTask.title}
                </h4>
                {activeTask.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {activeTask.description}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

export default BoardDetail;
