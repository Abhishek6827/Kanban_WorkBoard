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
        `${import.meta.env.VITE_API_URL}/boards/`,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">
            Loading your work boards...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Boards
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error loading your work boards. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My WorkBoards
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">
                  {user?.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div>
            <div className="flex justify-between items-center mb-8">
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
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Work Board
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => {
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
                    className="bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {board.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Created by {board.owner?.username}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        {board.description || "No description provided"}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{board.tasks?.length || 0} tasks</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
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
                            {peopleArray.map((person, index) => (
                              <div
                                key={index}
                                className={`w-8 h-8 rounded-full ${getAvatarColor(
                                  person.username
                                )} flex items-center justify-center text-white text-xs font-bold border-2 border-white relative`}
                                title={`${person.username}${
                                  person.isOwner ? " (Owner)" : ""
                                }`}
                              >
                                {getInitials(person.username)}
                                {person.isOwner && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-[8px] text-white">
                                      ★
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {peopleWhoCanSee.size > 6 && (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                                +{peopleWhoCanSee.size - 6}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-100 px-6 py-4 border-t border-yellow-200">
                      <Link
                        to={`/boards/${board.id}`}
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-white text-yellow-700 font-medium rounded-lg border border-yellow-300 hover:bg-yellow-50 transition-colors"
                      >
                        <span>View Board</span>
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Work Boards yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first work board to organize and
              track your tasks efficiently.
            </p>
            <Link
              to="/boards/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
