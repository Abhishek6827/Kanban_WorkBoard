// src/components/BoardHeader.jsx
import { ArrowLeft, Trash2 } from "lucide-react";

export const BoardHeader = ({ board, onBack, onDeleteBoard, canDelete }) => {
  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Boards</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
            <p className="text-sm text-gray-500">
              {board.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {canDelete && (
            <button
              onClick={onDeleteBoard}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Board
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
