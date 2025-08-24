// src/components/StatusColumn.jsx
import { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { InlineTaskForm } from "./InlineTaskForm";
import { Plus } from "lucide-react";

export const StatusColumn = ({
  status,
  tasks,
  onDeleteTask,
  onUpdateTask,
  onCreateTask,
  canEdit,
  boardId,
}) => {
  const [showInlineForm, setShowInlineForm] = useState(false);
  const { setNodeRef, isOver } = useSortable({
    id: status,
    data: { type: "status", status },
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "To-Do":
        return {
          color: "bg-blue-500",
          icon: "○",
          textColor: "text-white",
        };
      case "In Progress":
        return {
          color: "bg-yellow-500",
          icon: "⏳",
          textColor: "text-white",
        };
      case "Completed":
        return {
          color: "bg-green-500",
          icon: "✓",
          textColor: "text-white",
        };
      default:
        return {
          color: "bg-gray-500",
          icon: "○",
          textColor: "text-white",
        };
    }
  };

  const config = getStatusConfig(status);

  const handleCreateTask = (taskData) => {
    onCreateTask({
      ...taskData,
      status: status, // Set the status to the column's status
    });
    setShowInlineForm(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] transition-all duration-300 ${
        isOver
          ? "bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg"
          : ""
      }`}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
        <div
          className={`p-6 rounded-t-xl flex justify-between items-center ${config.color}`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{config.icon}</span>
            <h3 className={`text-xl font-semibold ${config.textColor}`}>
              {status}
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full ${config.textColor} bg-white bg-opacity-20`}
          >
            {tasks.length}
          </span>
        </div>

        <div className="p-4">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                canEdit={canEdit}
              />
            ))}
          </SortableContext>

          {showInlineForm ? (
            <InlineTaskForm
              boardId={boardId}
              onCreateTask={handleCreateTask}
              onCancel={() => setShowInlineForm(false)}
              defaultStatus={status}
            />
          ) : (
            <button
              onClick={() => setShowInlineForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </button>
          )}

          {tasks.length === 0 && !showInlineForm && (
            <div className="text-center py-8 text-gray-400">
              <p>No tasks in {status}</p>
              <p className="text-sm mt-1">Click "+ Add Task" to create one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
