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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedBoard.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-2xl font-bold text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Board name"
                  />
                  <textarea
                    value={editedBoard.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={2}
                    className="w-full text-gray-600 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Board description"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {board.name}
                  </h1>
                  {board.description && (
                    <p className="text-gray-600 mt-1">{board.description}</p>
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
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                {canDelete && (
                  <button
                    onClick={onDeleteBoard}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
