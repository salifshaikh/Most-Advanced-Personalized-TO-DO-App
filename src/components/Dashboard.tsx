import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { Sidebar } from './Sidebar';
import { TodoItem } from './TodoItem';
import { TodoModal } from './TodoModal';
import { CategoryModal } from './CategoryModal';
import { TagManager } from './TagManager';
import { Statistics } from './Statistics';
import { Search, Plus, Loader2, SlidersHorizontal, Menu, X } from 'lucide-react';
import { TodoWithDetails } from '../lib/supabase';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo, addSubtask, updateSubtask, reorderTodos, refreshTodos } = useTodos();
  const { categories, addCategory } = useCategories();
  const { tags, addTag, addTagToTodo, removeTagFromTodo } = useTags();
  
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoWithDetails | undefined>();
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority'>('created');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed).length,
      overdue: todos.filter((t) => t.due_date && new Date(t.due_date) < now && !t.completed).length,
    };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    if (activeView === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (activeView === 'pending') {
      filtered = filtered.filter((t) => !t.completed);
    } else if (activeView === 'overdue') {
      const now = new Date();
      filtered = filtered.filter((t) => t.due_date && new Date(t.due_date) < now && !t.completed);
    } else if (activeView.startsWith('category-')) {
      const categoryId = activeView.replace('category-', '');
      filtered = filtered.filter((t) => t.category_id === categoryId);
    }

    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'due') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.order_index - b.order_index;
    });

    return filtered;
  }, [todos, activeView, searchQuery, filterPriority, sortBy]);

  const handleSaveTodo = async (todoData: any) => {
    if (todoData.id) {
      await updateTodo(todoData.id, todoData);
    } else {
      const newTodo = await addTodo(todoData);
      await refreshTodos();
      return newTodo;
    }
    await refreshTodos();
  };

  const handleAddSubtask = (todoId: string) => {
    const title = prompt('Enter subtask title:');
    if (title) {
      addSubtask(todoId, title);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex === dropIndex) return;

    const reordered = [...filteredTodos];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    await reorderTodos(reordered);
  };

  if (activeView === 'tags') {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          categories={categories}
          onAddCategory={() => setShowCategoryModal(true)}
          onSignOut={signOut}
          stats={stats}
          showMobile={showMobileSidebar}
          onCloseMobile={() => setShowMobileSidebar(false)}
        />
        <div className="flex-1 overflow-auto">
          <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 lg:p-8">
            <TagManager />
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          categories={categories}
          onAddCategory={() => setShowCategoryModal(true)}
          onSignOut={signOut}
          stats={stats}
          showMobile={showMobileSidebar}
          onCloseMobile={() => setShowMobileSidebar(false)}
        />
        <div className="flex-1 overflow-auto">
          <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 lg:p-8">
            <Statistics todos={todos} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setShowMobileSidebar(false);
        }}
        categories={categories}
        onAddCategory={() => setShowCategoryModal(true)}
        onSignOut={signOut}
        stats={stats}
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">
            {activeView === 'all' ? 'All Tasks' : 
             activeView === 'pending' ? 'Pending' :
             activeView === 'completed' ? 'Completed' :
             activeView === 'overdue' ? 'Overdue' :
             categories.find(c => c.id === activeView.replace('category-', ''))?.name || 'Tasks'}
          </h1>
          <button
            onClick={() => setShowTodoModal(true)}
            className="p-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-800">
              {activeView === 'all' ? 'All Tasks' : 
               activeView === 'pending' ? 'Pending Tasks' :
               activeView === 'completed' ? 'Completed Tasks' :
               activeView === 'overdue' ? 'Overdue Tasks' :
               categories.find(c => c.id === activeView.replace('category-', ''))?.name || 'Tasks'}
            </h1>
            <button
              onClick={() => setShowTodoModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold inline-flex items-center gap-2 transition shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created">Created Date</option>
                  <option value="due">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          
          {showFilters && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="created">Created Date</option>
                  <option value="due">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2">No tasks found</h3>
              <p className="text-sm lg:text-base text-slate-500 mb-6">Create your first task to get started</p>
              <button
                onClick={() => setShowTodoModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold inline-flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </button>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              {filteredTodos.map((todo, index) => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <TodoItem
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={(todo) => {
                      setEditingTodo(todo);
                      setShowTodoModal(true);
                    }}
                    onAddSubtask={handleAddSubtask}
                    onToggleSubtask={(id, completed) => updateSubtask(id, { completed })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <button
          onClick={() => setShowTodoModal(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <TodoModal
        isOpen={showTodoModal}
        onClose={() => {
          setShowTodoModal(false);
          setEditingTodo(undefined);
        }}
        onSave={handleSaveTodo}
        todo={editingTodo}
        categories={categories}
        tags={tags}
        onCreateTag={async (name) => {
          const tag = await addTag({ name, color: '#10b981' });
          return tag;
        }}
        onAddTagToTodo={addTagToTodo}
        onRemoveTagFromTodo={removeTagFromTodo}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={async (category) => {
          await addCategory(category);
        }}
      />
    </div>
  );
}
