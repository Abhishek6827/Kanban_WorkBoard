// src/components/TaskCard.jsx
import { useState } from "react";
import {
  GripVertical,
  Edit3,
  Trash2,
  Save,
  X,
  Mail,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const TaskCard = ({ task, onDelete, onUpdate, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
  };

  // Custom drag listeners that ignore button clicks
  const customListeners = {
    ...listeners,
    onPointerDown: (event) => {
      // Check if the click target is a button or inside a button
      const target = event.target;
      const isButton = target.closest('button') !== null;
      
      if (!isButton && listeners.onPointerDown) {
        listeners.onPointerDown(event);
      }
    },
    onMouseDown: (event) => {
      // Check if the click target is a button or inside a button
      const target = event.target;
      const isButton = target.closest('button') !== null;
      
      if (!isButton && listeners.onMouseDown) {
        listeners.onMouseDown(event);
      }
    },
    onTouchStart: (event) => {
      // Check if the touch target is a button or inside a button
      const target = event.target;
      const isButton = target.closest('button') !== null;
      
      if (!isButton && listeners.onTouchStart) {
        listeners.onTouchStart(event);
      }
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To-Do":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // src/components/TaskCard.jsx - Update the handleSave function
  const handleSave = () => {
    onUpdate({
      ...editedTask,
      board: task.board.id || task.board, // Ensure board ID is included
    });
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border-2 border-blue-400 rounded-2xl p-5 mb-4 shadow-large animate-scale-in"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-lg"
              placeholder="Task title"
            />
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <textarea
          value={editedTask.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-4 resize-none"
          placeholder="Task description..."
        />

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assignee Email
              </label>
              <input
                type="email"
                value={editedTask.assignee_email || ""}
                onChange={(e) => handleChange("assignee_email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editedTask.status || "To-Do"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="To-Do">To-Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white border border-gray-200/50 rounded-2xl p-5 mb-4 shadow-soft hover:shadow-large transition-all duration-300 cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 ${
        isDragging ? "opacity-60 rotate-3 shadow-colored scale-105 z-50" : ""
      }`}
      {...attributes}
      {...customListeners}
    >
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-soft transition-all duration-200 ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </span>
        {task.assignee && (
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200/50">
            <Mail className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600 font-medium">{task.assignee.email}</span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
          <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {task.title}
          </h4>
        </div>
        {canEdit && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsEditing(true);
              }}
              className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(task.id);
              }}
              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="space-y-3 pt-3 border-t border-gray-100">
        {task.assignee && (
          <div className="flex items-center text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-100/50">
            <User className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-semibold text-gray-700">{task.assignee.username}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1.5 rounded-lg">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="font-medium">{new Date(task.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1.5 rounded-lg">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="font-medium">{new Date(task.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
