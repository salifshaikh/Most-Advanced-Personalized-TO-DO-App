import { useState } from 'react';
import { TodoWithDetails } from '../lib/supabase';
import { Check, Clock, MoreVertical, Trash2, Edit3, ChevronDown, ChevronRight, Plus, GripVertical, Tag as TagIcon } from 'lucide-react';
import { format as dateFnsFormat } from 'date-fns';

type TodoItemProps = {
  todo: TodoWithDetails;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: TodoWithDetails) => void;
  onAddSubtask: (todoId: string) => void;
  onToggleSubtask: (id: string, completed: boolean) => void;
  dragHandleProps?: any;
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  dragHandleProps
}: TodoItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const completedSubtasks = todo.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const hasSubtasks = totalSubtasks > 0;
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  return (
    <div className="group bg-white rounded-lg lg:rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
      <div className="p-3 lg:p-4">
        <div className="flex items-start gap-2 lg:gap-3">
          {/* Drag Handle - Hidden on mobile */}
          <div {...dragHandleProps} className="hidden lg:block cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-5 h-5 text-slate-400" />
          </div>

          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id, !todo.completed)}
            className={`flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded-lg border-2 transition flex items-center justify-center ${
              todo.completed
                ? 'bg-green-500 border-green-500'
                : 'border-slate-300 hover:border-blue-500'
            }`}
          >
            {todo.completed && <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />}
          </button>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1 lg:mb-2">
              <h3
                className={`text-base lg:text-lg font-semibold flex-1 break-words ${
                  todo.completed ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {todo.title}
              </h3>

              {/* Priority Badge */}
              <span
                className={`flex-shrink-0 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-lg text-xs font-bold border ${
                  priorityColors[todo.priority]
                }`}
              >
                {priorityLabels[todo.priority]}
              </span>
            </div>

            {/* Description */}
            {todo.description && (
              <p className="text-slate-600 text-sm mb-2 lg:mb-3 whitespace-pre-wrap break-words">
                {todo.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
              {/* Due Date */}
              {todo.due_date && (
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'
                  }`}
                >
                  <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span>{dateFnsFormat(new Date(todo.due_date), 'MMM d, yyyy')}</span>
                </div>
              )}

              {/* Category */}
              {todo.category && (
                <div
                  className="px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${todo.category.color}20`,
                    color: todo.category.color,
                  }}
                >
                  {todo.category.name}
                </div>
              )}

              {/* Tags */}
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex items-center gap-1 lg:gap-1.5">
                  <TagIcon className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-400" />
                  <div className="flex flex-wrap gap-1 lg:gap-1.5">
                    {todo.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-1.5 lg:px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks Progress */}
              {hasSubtasks && (
                <div className="text-slate-500 text-xs font-medium">
                  {completedSubtasks}/{totalSubtasks} subtasks
                </div>
              )}
            </div>

            {/* Subtasks */}
            {hasSubtasks && (
              <div className="mt-2 lg:mt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {expanded ? 'Hide' : 'Show'} subtasks
                </button>

                {expanded && (
                  <div className="mt-2 space-y-2 pl-3 lg:pl-4 border-l-2 border-slate-200">
                    {todo.subtasks?.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleSubtask(subtask.id, !subtask.completed)}
                          className={`flex-shrink-0 w-4 h-4 lg:w-5 lg:h-5 rounded border-2 transition flex items-center justify-center ${
                            subtask.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {subtask.completed && <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />}
                        </button>
                        <span
                          className={`text-xs lg:text-sm break-words ${
                            subtask.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-700'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Subtask Button */}
            <button
              onClick={() => onAddSubtask(todo.id)}
              className="mt-2 lg:mt-3 flex items-center gap-1.5 text-xs lg:text-sm text-slate-500 hover:text-blue-600 transition"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
              Add subtask
            </button>
          </div>

          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 lg:p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] lg:min-w-[140px] z-20">
                  <button
                    onClick={() => {
                      onEdit(todo);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 lg:px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Edit3 className="w-3 h-3 lg:w-4 lg:h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(todo.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 lg:px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
