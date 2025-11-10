import { useMemo } from 'react';
import { TodoWithDetails } from '../lib/supabase';
import { CheckCircle2, Clock, TrendingUp, Calendar, Target, Zap } from 'lucide-react';

type StatisticsProps = {
  todos: TodoWithDetails[];
};

export function Statistics({ todos }: StatisticsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = todos.filter((t) => !t.completed).length;
    const overdue = todos.filter(
      (t) => t.due_date && new Date(t.due_date) < now && !t.completed
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityCounts = {
      urgent: todos.filter((t) => t.priority === 'urgent' && !t.completed).length,
      high: todos.filter((t) => t.priority === 'high' && !t.completed).length,
      medium: todos.filter((t) => t.priority === 'medium' && !t.completed).length,
      low: todos.filter((t) => t.priority === 'low' && !t.completed).length,
    };

    const thisWeek = todos.filter((t) => {
      const created = new Date(t.created_at);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length;

    const completedThisWeek = todos.filter((t) => {
      if (!t.completed_at) return false;
      const completed = new Date(t.completed_at);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return completed >= weekAgo;
    }).length;

    const upcomingDue = todos.filter((t) => {
      if (!t.due_date || t.completed) return false;
      const due = new Date(t.due_date);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return due >= now && due <= threeDaysFromNow;
    }).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      priorityCounts,
      thisWeek,
      completedThisWeek,
      upcomingDue,
    };
  }, [todos]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Statistics</h2>
          <p className="text-sm lg:text-base text-slate-500 mt-1">Track your productivity and progress</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Target className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-blue-900">Total</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs lg:text-sm text-blue-700 mt-1">All time</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-green-900">Done</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-green-900">{stats.completed}</div>
            <p className="text-xs lg:text-sm text-green-700 mt-1">
              {stats.completionRate}% completion rate
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-orange-900">Pending</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-orange-900">{stats.pending}</div>
            <p className="text-xs lg:text-sm text-orange-700 mt-1">Waiting to be completed</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2">
              <div className="p-2 bg-red-600 rounded-lg">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-red-900">Overdue</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-red-900">{stats.overdue}</div>
            <p className="text-xs lg:text-sm text-red-700 mt-1">Past due date</p>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-slate-50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">Priority Breakdown</h3>
            <div className="space-y-3 lg:space-y-4">
              {Object.entries(stats.priorityCounts).map(([priority, count]) => (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1.5 lg:mb-2">
                    <span className="text-xs lg:text-sm font-medium text-slate-600 capitalize">
                      {priority}
                    </span>
                    <span className="text-xs lg:text-sm font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        priority === 'urgent'
                          ? 'bg-red-500'
                          : priority === 'high'
                          ? 'bg-orange-500'
                          : priority === 'medium'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                      style={{
                        width: `${stats.pending > 0 ? (count / stats.pending) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">Weekly Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="p-2 lg:p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xl lg:text-2xl font-bold text-slate-800">{stats.thisWeek}</div>
                  <p className="text-xs lg:text-sm text-slate-600">Created (Last 7 days)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="p-2 lg:p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xl lg:text-2xl font-bold text-slate-800">{stats.completedThisWeek}</div>
                  <p className="text-xs lg:text-sm text-slate-600">Completed (Last 7 days)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-purple-600 rounded-xl">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-bold text-purple-900">Upcoming Deadlines</h3>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-purple-900 mb-2">{stats.upcomingDue}</div>
            <p className="text-xs lg:text-sm text-purple-700">
              {stats.upcomingDue === 1 ? 'task is' : 'tasks are'} due in the next 3 days
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-cyan-600 rounded-xl">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-bold text-cyan-900">Productivity Score</h3>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-cyan-900 mb-2">
              {stats.completionRate}%
            </div>
            <p className="text-xs lg:text-sm text-cyan-700">
              You've completed {stats.completionRate}% of your tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
