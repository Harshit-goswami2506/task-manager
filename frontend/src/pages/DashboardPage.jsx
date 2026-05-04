import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Users, ArrowRight, Calendar
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card p-5 flex items-center gap-4 animate-fade-in">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    'To Do': 'badge-todo',
    'In Progress': 'badge-inprogress',
    'Done': 'badge-done'
  };
  return <span className={map[status] || 'badge-todo'}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = {
    'Low': 'badge-low',
    'Medium': 'badge-medium',
    'High': 'badge-high'
  };
  return <span className={map[priority] || 'badge-medium'}>{priority}</span>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 bg-slate-100 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-24 animate-pulse bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentTasks, overdueTaskList, tasksByUser } = data || {};

  const statCards = [
    { icon: FolderKanban, label: 'Projects', value: stats?.totalProjects || 0, color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: TrendingUp, label: 'Total Tasks', value: stats?.totalTasks || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: CheckCircle2, label: 'Completed', value: stats?.doneTasks || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: AlertTriangle, label: 'Overdue', value: stats?.overdueTasks || 0, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-primary-600">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening with your projects today</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Status breakdown */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          Tasks by Status
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'To Do', value: stats?.todoTasks || 0, color: 'bg-slate-200', text: 'text-slate-600' },
            { label: 'In Progress', value: stats?.inProgressTasks || 0, color: 'bg-blue-400', text: 'text-blue-700' },
            { label: 'Done', value: stats?.doneTasks || 0, color: 'bg-emerald-400', text: 'text-emerald-700' },
          ].map(item => (
            <div key={item.label} className="text-center p-4 bg-slate-50 rounded-xl">
              <div className={`text-3xl font-bold ${item.text}`}>{item.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{item.label}</div>
              <div className={`h-1 ${item.color} rounded-full mt-3 mx-auto`}
                style={{ width: `${stats?.totalTasks ? (item.value / stats.totalTasks) * 100 : 0}%`, minWidth: '8px', maxWidth: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Tasks</h3>
            <Link to="/my-tasks" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentTasks?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No tasks yet. Create a project to get started!</p>
          ) : (
            <div className="space-y-3">
              {recentTasks?.map(task => (
                <div key={task._id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && isValid(new Date(task.dueDate)) && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.assignedTo && (
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedTo.name}&backgroundColor=6366f1&fontFamily=Helvetica&fontSize=40&fontWeight=600`}
                      alt={task.assignedTo.name}
                      title={task.assignedTo.name}
                      className="w-7 h-7 rounded-full flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            Overdue Tasks
            {overdueTaskList?.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{overdueTaskList.length}</span>
            )}
          </h3>
          {overdueTaskList?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No overdue tasks! You're on track 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTaskList?.map(task => (
                <div key={task._id} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Due {task.dueDate && isValid(new Date(task.dueDate)) ? format(new Date(task.dueDate), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team workload */}
      {tasksByUser?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-slate-400" /> Team Workload
          </h3>
          <div className="space-y-3">
            {tasksByUser.map(item => (
              <div key={item.user._id} className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.user.name}&backgroundColor=6366f1&fontFamily=Helvetica&fontSize=40&fontWeight=600`}
                  alt={item.user.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.user.name}</span>
                    <span className="text-xs text-slate-500">{item.done}/{item.total} done</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${item.total ? (item.done / item.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
