// src/components/BoardHeader.jsx
import { useState } from "react";
import { ArrowLeft, Edit3, Save, X, Trash2 } from "lucide-react";

export const BoardHeader = ({
  board,
  onBack,
  onDeleteBoard,
  canDelete,
  onUpdateBoard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBoard, setEditedBoard] = useState({ ...board });

  const handleSave = () => {
    onUpdateBoard(editedBoard);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBoard({ ...board });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedBoard((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-soft sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 group"
              title="Back to boards"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
            </button>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3 animate-fade-in">
                  <input
                    type="text"
                    value={editedBoard.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-2 border-blue-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-soft"
                    placeholder="Board name"
                  />
                  <textarea
                    value={editedBoard.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={2}
                    className="w-full text-gray-600 border-2 border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-soft"
                    placeholder="Board description"
                  />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Kanban Workboard
                    </h2>
                    <span className="text-gray-300">•</span>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      {board.name}
                    </h1>
                  </div>
                  {board.description && (
                    <p className="text-gray-600 mt-1 font-medium">{board.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-soft"
                  title="Save changes"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-soft"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-soft"
                  title="Edit board"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                {canDelete && (
                  <button
                    onClick={onDeleteBoard}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-soft"
                    title="Delete board"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
