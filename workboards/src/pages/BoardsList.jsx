import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  LogOut,
  User,
  FolderOpen,
  Calendar,
  Users,
  ChevronRight,
  Eye,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../api";

const BoardsList = () => {
  const { user, logout, token } = useAuth();

  const {
    data: boards = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_URL}/boards/`,
        {
          headers: {
            Authorization: token ? `Token ${token}` : "",
          },
        }
      );
      return data;
    },
    retry: 1,
    enabled: !!token,
  });

  const handleLogout = async () => {
    await logout();
  };

  // Function to get user initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to get random color for user avatar
  const getAvatarColor = (name) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-medium"></div>
            <div className="absolute inset-0 rounded-full bg-blue-600 opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold animate-pulse">
            Loading your work boards...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium transform transition-transform duration-300 hover:scale-110">
            <span className="text-5xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Boards
          </h2>
          <p className="text-gray-600 mb-8">
            There was an error loading your work boards. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold transform hover:scale-105 hover:shadow-medium active:scale-95 shadow-soft"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-medium transform transition-transform duration-300 hover:scale-110">
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Kanban Workboard
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage your projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 rounded-xl border border-gray-200/50 shadow-soft">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(user?.username)}
                </div>
                <span className="font-semibold text-gray-700">
                  {user?.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {boards.length > 0 ? (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Work Boards
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage and organize your projects
                </p>
              </div>
              <Link
                to="/boards/create"
                className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold transform hover:scale-105 hover:shadow-medium active:scale-95 shadow-soft"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Work Board
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board, index) => {
                // Get all people who can see this board
                const peopleWhoCanSee = new Set();

                // Always add board owner
                if (board.owner?.username) {
                  peopleWhoCanSee.add({
                    username: board.owner.username,
                    isOwner: true,
                  });
                }

                // Add task assignees if tasks data is available
                if (board.tasks && Array.isArray(board.tasks)) {
                  board.tasks.forEach((task) => {
                    if (task.assignee && task.assignee.username) {
                      peopleWhoCanSee.add({
                        username: task.assignee.username,
                        isOwner: false,
                      });
                    }
                  });
                }

                const peopleArray = Array.from(peopleWhoCanSee).slice(0, 6);

                return (
                  <div
                    key={board.id}
                    className="group bg-white rounded-2xl border border-gray-200/50 shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                            <FolderOpen className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
                              {board.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Created by {board.owner?.username}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2">
                        {board.description || "No description provided"}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">{board.tasks?.length || 0} tasks</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(board.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* People who can see this board */}
                      {peopleArray.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>Can see this board:</span>
                          </div>
                          <div className="flex -space-x-2">
                            {peopleArray.map((person, idx) => (
                              <div
                                key={idx}
                                className={`w-9 h-9 rounded-full ${getAvatarColor(
                                  person.username
                                )} flex items-center justify-center text-white text-xs font-bold border-2 border-white relative transform transition-transform duration-200 hover:scale-110 hover:z-10 shadow-soft`}
                                title={`${person.username}${
                                  person.isOwner ? " (Owner)" : ""
                                }`}
                              >
                                {getInitials(person.username)}
                                {person.isOwner && (
                                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-medium border-2 border-white">
                                    <span className="text-[9px] text-white">★</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {peopleWhoCanSee.size > 6 && (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white shadow-soft">
                                +{peopleWhoCanSee.size - 6}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-t border-gray-200/50">
                      <Link
                        to={`/boards/${board.id}`}
                        className="group/btn inline-flex items-center justify-center w-full px-4 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 transform hover:scale-[1.02] shadow-soft hover:shadow-medium"
                      >
                        <span>View Board</span>
                        <ChevronRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6 shadow-medium transform transition-transform duration-300 hover:scale-110">
              <Plus className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              No Work Boards yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Get started by creating your first work board to organize and
              track your tasks efficiently.
            </p>
            <Link
              to="/boards/create"
              className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold transform hover:scale-105 hover:shadow-medium active:scale-95 shadow-soft"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Work Board
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default BoardsList;
