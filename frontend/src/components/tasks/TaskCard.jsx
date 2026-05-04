import { useState } from 'react';
import { Calendar, Trash2, Edit2, User, AlertCircle } from 'lucide-react';
import { format, isValid, isPast } from 'date-fns';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const statusClass = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', 'Done': 'badge-done' };
const priorityClass = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high' };

export default function TaskCard({ task, isAdmin, members = [], onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...task, assignedTo: task.assignedTo?._id || '' });
  const [loading, setLoading] = useState(false);

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done';

  const handleSave = async () => {
    setLoading(true);
    await onUpdate(task._id, {
      ...form,
      assignedTo: form.assignedTo || null,
      dueDate: form.dueDate || null
    });
    setLoading(false);
    setEditing(false);
  };

  const handleStatusChange = async (e) => {
    await onUpdate(task._id, { status: e.target.value });
  };

  if (editing && isAdmin) {
    return (
      <div className="card p-4 border-2 border-primary-200 animate-fade-in">
        <div className="space-y-3">
          <input className="input text-sm font-medium" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
          <textarea className="input text-sm resize-none" rows={2} value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <div className="grid grid-cols-2 gap-2">
            <select className="input text-sm" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="input text-sm" value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="input text-sm" value={form.dueDate ? form.dueDate.slice(0, 10) : ''}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <select className="input text-sm" value={form.assignedTo}
              onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary flex-1 justify-center text-xs py-1.5">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center text-xs py-1.5">
              {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-4 hover:shadow-md transition-all duration-200 group ${isOverdue ? 'border-red-200' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isOverdue && <AlertCircle size={12} className="text-red-500 flex-shrink-0" />}
            <h4 className="text-sm font-semibold text-slate-800 truncate">{task.title}</h4>
          </div>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {isAdmin ? (
              <select
                value={task.status}
                onChange={handleStatusChange}
                className="text-xs border border-slate-200 rounded-full px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <span className={statusClass[task.status] || 'badge-todo'}>{task.status}</span>
            )}
            <span className={priorityClass[task.priority] || 'badge-medium'}>{task.priority}</span>
            {task.dueDate && isValid(new Date(task.dueDate)) && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                <Calendar size={10} />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {task.assignedTo ? (
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedTo.name}&backgroundColor=6366f1&fontFamily=Helvetica&fontSize=40&fontWeight=600`}
              alt={task.assignedTo.name}
              title={task.assignedTo.name}
              className="w-7 h-7 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center" title="Unassigned">
              <User size={12} className="text-slate-400" />
            </div>
          )}
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => setEditing(true)}
                className="p-1 rounded text-slate-300 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                <Edit2 size={12} />
              </button>
              <button onClick={() => onDelete(task._id)}
                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
