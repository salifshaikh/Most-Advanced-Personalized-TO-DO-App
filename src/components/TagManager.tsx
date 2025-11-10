import { useState } from 'react';
import { useTags } from '../hooks/useTags';
import { Plus, Trash2, Palette } from 'lucide-react';

const colors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#475569', '#1e293b',
];

export function TagManager() {
  const { tags, addTag, deleteTag } = useTags();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTag({ name, color });
    setName('');
    setColor('#10b981');
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Tag Manager</h2>
            <p className="text-sm lg:text-base text-slate-500 mt-1">Organize your tasks with custom tags</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 text-sm lg:text-base"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            New Tag
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 lg:mb-8 p-4 lg:p-6 bg-slate-50 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tag Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm lg:text-base"
                placeholder="e.g., Urgent, Important, Review"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Color
              </label>
              <div className="grid grid-cols-8 lg:grid-cols-10 gap-2 lg:gap-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition text-sm lg:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition text-sm lg:text-base"
              >
                Create Tag
              </button>
            </div>
          </form>
        )}

        {tags.length === 0 ? (
          <div className="text-center py-12 lg:py-16">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2">No tags yet</h3>
            <p className="text-sm lg:text-base text-slate-500">Create your first tag to organize your tasks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 lg:p-5 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm lg:text-base truncate">{tag.name}</h3>
                    <p className="text-xs lg:text-sm text-slate-500">
                      {new Date(tag.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="ml-2 p-2 hover:bg-red-50 text-red-600 rounded-lg transition flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
