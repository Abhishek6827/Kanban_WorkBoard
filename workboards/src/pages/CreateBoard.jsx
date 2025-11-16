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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-soft sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  currentStep === 1 ? navigate("/") : goBackToBoard()
                }
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 transform hover:scale-105 active:scale-95 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">
                  {currentStep === 1 ? "Back to Boards" : "Back to Board Details"}
                </span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Kanban Workboard
              </h2>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-medium transform transition-transform duration-300 hover:scale-110">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Create a WorkBoard
          </h1>
          <div className="flex items-center justify-center space-x-3 mt-6">
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentStep === 1 ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-medium scale-110" : "bg-gray-300"
              }`}
            ></div>
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
              currentStep >= 2 ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gray-300"
            }`}></div>
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentStep === 2 ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-medium scale-110" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-4 font-medium">
            Step {currentStep} of 2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Board Details */}
          {currentStep === 1 && (
            <>
              <div className="bg-white rounded-2xl shadow-medium border border-gray-200/50 p-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Board Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium transition-all duration-200 hover:border-gray-400 shadow-soft"
                      placeholder="Enter board name"
                      value={formData.name}
                      onChange={handleBoardChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-200 hover:border-gray-400 shadow-soft"
                      placeholder="Enter board description"
                      value={formData.description}
                      onChange={handleBoardChange}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-medium border border-gray-200/50 p-6 animate-fade-in">
                <button
                  type="button"
                  onClick={goToAddTasks}
                  className="group w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50/50 transition-all duration-200 font-semibold transform hover:scale-[1.02] active:scale-95 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2 transform group-hover:rotate-90 transition-transform duration-200" />
                  + Add a task
                </button>
              </div>

              <button
                type="submit"
                disabled={createBoardMutation.isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 shadow-medium hover:shadow-large text-lg"
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
              <div className="bg-white rounded-2xl shadow-medium border border-gray-200/50 p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
                  <button
                    type="button"
                    onClick={addTask}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95 shadow-medium hover:shadow-large"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="border-2 border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-soft hover:shadow-medium transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h4 className="font-bold text-gray-900 text-lg">
                          Task {index + 1}
                        </h4>
                        {tasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                            title="Remove task"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-soft font-medium"
                            placeholder="Enter task title"
                            value={task.title}
                            onChange={(e) =>
                              handleTaskChange(task.id, "title", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Assign to
                          </label>
                          <select
                            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-soft font-medium"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-200 hover:border-gray-400 shadow-soft"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-soft font-medium"
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
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 shadow-medium hover:shadow-large text-lg"
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
