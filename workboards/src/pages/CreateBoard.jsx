// CreateBoard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, X } from "lucide-react";
import { createBoard, createTask, getUsers } from "../../src/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const CreateBoard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "",
      description: "",
      assignee: "",
      status: "To-Do",
    },
  ]);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!token,
  });

  const createBoardMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Work Board created successfully!");

      if (currentStep === 1) {
        setCurrentStep(2);
      } else {
        navigate(`/boards/${board.id}`);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create board";
      toast.error(errorMessage);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to create task";
      toast.error(errorMessage);
    },
  });

  const handleBoardChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (taskId, field, value) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: "",
      description: "",
      assignee: "",
      status: "To-Do",
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Board title is required");
      return;
    }

    if (currentStep === 1) {
      try {
        await createBoardMutation.mutateAsync(formData);
      } catch (error) {
        console.error("Error creating board:", error);
      }
    } else {
      try {
        // Create the board first
        const board = await createBoardMutation.mutateAsync(formData);

        // Then create tasks for this board
        const validTasks = tasks.filter((task) => task.title.trim());
        if (validTasks.length > 0) {
          const taskPromises = validTasks.map((task) =>
            createTaskMutation.mutateAsync({
              title: task.title,
              description: task.description,
              assignee: task.assignee || null,
              status: task.status,
              board: board.id,
            })
          );

          await Promise.all(taskPromises);
        }

        queryClient.invalidateQueries({ queryKey: ["board", board.id] });
        toast.success("Work Board and tasks created successfully!");
        navigate(`/boards/${board.id}`);
      } catch (error) {
        console.error("Error creating board with tasks:", error);
      }
    }
  };

  const goToAddTasks = () => {
    if (!formData.name.trim()) {
      toast.error("Board title is required");
      return;
    }
    setCurrentStep(2);
  };

  const goBackToBoard = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                currentStep === 1 ? navigate("/") : goBackToBoard()
              }
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {currentStep === 1 ? "Back to Boards" : "Back to Board Details"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create a WorkBoard
          </h1>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === 1 ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === 2 ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Board Details */}
          {currentStep === 1 && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      placeholder="Enter board name"
                      value={formData.name}
                      onChange={handleBoardChange}
                    />
                  </div>
                  <div>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      placeholder="Enter board description"
                      value={formData.description}
                      onChange={handleBoardChange}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                  type="button"
                  onClick={goToAddTasks}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
                >
                  + Add a task
                </button>
              </div>

              <button
                type="submit"
                disabled={createBoardMutation.isLoading}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBoardMutation.isLoading
                  ? "Creating..."
                  : "Create Work Board"}
              </button>
            </>
          )}

          {/* Step 2: Add Tasks */}
          {currentStep === 2 && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                  <button
                    type="button"
                    onClick={addTask}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Task {index + 1}
                        </h4>
                        {tasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter task title"
                            value={task.title}
                            onChange={(e) =>
                              handleTaskChange(task.id, "title", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign to
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={task.assignee}
                            onChange={(e) =>
                              handleTaskChange(
                                task.id,
                                "assignee",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select user</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.username}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          placeholder="Enter task description"
                          value={task.description}
                          onChange={(e) =>
                            handleTaskChange(
                              task.id,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={task.status}
                          onChange={(e) =>
                            handleTaskChange(task.id, "status", e.target.value)
                          }
                        >
                          <option value="To-Do">To-Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  createBoardMutation.isLoading || createTaskMutation.isLoading
                }
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBoardMutation.isLoading || createTaskMutation.isLoading
                  ? "Creating..."
                  : "Create Work Board"}
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
};

export default CreateBoard;
