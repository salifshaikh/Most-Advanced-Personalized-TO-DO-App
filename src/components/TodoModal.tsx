import { useState, useEffect } from 'react';
import { TodoWithDetails, Category, Tag } from '../lib/supabase';
import { X, Calendar, Tag as TagIcon, Folder, AlertCircle } from 'lucide-react';

type TodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: any) => void;
  todo?: TodoWithDetails;
  categories: Category[];
  tags: Tag[];
  onCreateTag: (name: string) => Promise<Tag>;
  onAddTagToTodo?: (todoId: string, tagId: string) => void;
  onRemoveTagFromTodo?: (todoId: string, tagId: string) => void;
};

const priorities = ['low', 'medium', 'high', 'urgent'] as const;

export function TodoModal({
  isOpen,
  onClose,
  onSave,
  todo,
  categories,
  tags,
  onCreateTag,
  onAddTagToTodo,
  onRemoveTagFromTodo,
}: TodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setDueDate(todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '');
      setCategoryId(todo.category_id || '');
      setSelectedTags(todo.tags?.map((t) => t.id) || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setCategoryId('');
      setSelectedTags([]);
    }
  }, [todo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const todoData = {
      title,
      description,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      category_id: categoryId || null,
    };

    if (todo) {
      await onSave({ id: todo.id, ...todoData });
      const currentTagIds = todo.tags?.map((t) => t.id) || [];
      const tagsToAdd = selectedTags.filter((id) => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter((id) => !selectedTags.includes(id));

      if (onAddTagToTodo && onRemoveTagFromTodo) {
        for (const tagId of tagsToAdd) {
          await onAddTagToTodo(todo.id, tagId);
        }
        for (const tagId of tagsToRemove) {
          await onRemoveTagFromTodo(todo.id, tagId);
        }
      }
    } else {
      const newTodo = await onSave(todoData);
      if (newTodo && selectedTags.length > 0 && onAddTagToTodo) {
        for (const tagId of selectedTags) {
          await onAddTagToTodo(newTodo.id, tagId);
        }
      }
    }
    onClose();
  };

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      const tag = await onCreateTag(newTagName.trim());
      setSelectedTags([...selectedTags, tag.id]);
      setNewTagName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl w-full lg:w-full lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
            {todo ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm lg:text-base"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm lg:text-base"
              placeholder="Add more details..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm lg:text-base"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm lg:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm lg:text-base"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <TagIcon className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    if (selectedTags.includes(tag.id)) {
                      setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                    } else {
                      setSelectedTags([...selectedTags, tag.id]);
                    }
                  }}
                  className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium transition ${
                    selectedTags.includes(tag.id)
                      ? 'ring-2 ring-offset-1'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Create new tag..."
                className="flex-1 px-3 lg:px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm lg:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCreateTag}
                className="px-3 lg:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-sm lg:text-base"
              >
                Add Tag
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition text-sm lg:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/30 text-sm lg:text-base"
            >
              {todo ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
