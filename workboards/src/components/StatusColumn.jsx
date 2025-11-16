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
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 border-dashed rounded-2xl transform scale-[1.02]"
          : ""
      }`}
    >
      <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium border border-gray-200/50 h-full transition-all duration-300 transform hover:-translate-y-0.5">
        <div
          className={`p-6 rounded-t-2xl flex justify-between items-center ${config.color} shadow-soft`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl transform transition-transform duration-300 hover:scale-110">{config.icon}</span>
            <h3 className={`text-xl font-bold ${config.textColor}`}>
              {status}
            </h3>
          </div>
          <span
            className={`px-3.5 py-1.5 rounded-full ${config.textColor} bg-white bg-opacity-30 font-bold text-sm shadow-soft`}
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
              className="group w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center font-medium transform hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2 transform group-hover:rotate-90 transition-transform duration-200" />
              Add Task
            </button>
          )}

          {tasks.length === 0 && !showInlineForm && (
            <div className="text-center py-12 text-gray-400 animate-fade-in">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                <span className="text-2xl">{config.icon}</span>
              </div>
              <p className="font-medium">No tasks in {status}</p>
              <p className="text-sm mt-2">Click "+ Add Task" to create one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
