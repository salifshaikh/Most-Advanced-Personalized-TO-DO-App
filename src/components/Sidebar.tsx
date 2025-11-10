import { Category } from '../lib/supabase';
import { LayoutGrid, CheckCircle2, Clock, Calendar, Folder, Tag, Settings, LogOut, Plus, X } from 'lucide-react';

type SidebarProps = {
  activeView: string;
  onViewChange: (view: string) => void;
  categories: Category[];
  onAddCategory: () => void;
  onSignOut: () => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  showMobile?: boolean;
  onCloseMobile?: () => void;
};

export function Sidebar({
  activeView,
  onViewChange,
  categories,
  onAddCategory,
  onSignOut,
  stats,
  showMobile = false,
  onCloseMobile
}: SidebarProps) {
  const views = [
    { id: 'all', label: 'All Tasks', icon: LayoutGrid, count: stats.total },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pending },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: stats.completed },
    { id: 'overdue', label: 'Overdue', icon: Calendar, count: stats.overdue },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {showMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-80 bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300
        ${showMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-800">TaskMaster</h2>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500">Stay organized, get things done</p>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1 mb-6">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                    activeView === view.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{view.label}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeView === view.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {view.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</h3>
              <button
                onClick={onAddCategory}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-1">
              {categories.length === 0 ? (
                <p className="px-4 py-2 text-sm text-slate-400 text-center">No categories yet</p>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onViewChange(`category-${category.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      activeView === `category-${category.id}`
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Folder 
                      className="w-5 h-5" 
                      style={{ color: category.color }}
                    />
                    <span className="flex-1 text-left truncate">{category.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Tags & Settings */}
          <div className="space-y-1">
            <button
              onClick={() => onViewChange('tags')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeView === 'tags'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-5 h-5" />
              <span>Manage Tags</span>
            </button>
            <button
              onClick={() => onViewChange('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeView === 'settings'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Statistics</span>
            </button>
          </div>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
