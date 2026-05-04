import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckSquare, Calendar, AlertCircle, FolderKanban } from 'lucide-react';
import { format, isValid, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const statusClass = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', 'Done': 'badge-done' };
const priorityClass = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high' };
const STATUSES = ['To Do', 'In Progress', 'Done'];

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/tasks/my-tasks')
      .then(res => setTasks(res.data.tasks))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-slate-50" />)}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s}
            <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
              filter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {s === 'All' ? tasks.length : tasks.filter(t => t.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckSquare size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-500">
            {filter === 'All' ? 'No tasks assigned to you' : `No ${filter} tasks`}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'All' ? 'Ask your team admin to assign you some tasks' : 'Switch filters to see other tasks'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done';
            return (
              <div
                key={task._id}
                className={`card p-4 hover:shadow-sm transition-all animate-slide-up ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isOverdue && <AlertCircle size={13} className="text-red-500 flex-shrink-0" />}
                      <h4 className="text-sm font-semibold text-slate-800">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={priorityClass[task.priority] || 'badge-medium'}>{task.priority}</span>
                      {task.project && (
                        <Link to={`/projects/${task.project._id}`}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                          onClick={e => e.stopPropagation()}>
                          <FolderKanban size={10} />
                          {task.project.name}
                        </Link>
                      )}
                      {task.dueDate && isValid(new Date(task.dueDate)) && (
                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                          <Calendar size={10} />
                          {isOverdue ? 'Overdue · ' : ''}{format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={e => handleStatusUpdate(task._id, e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer flex-shrink-0"
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
