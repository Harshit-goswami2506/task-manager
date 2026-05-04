import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/tasks/TaskCard';
import {
  ArrowLeft, Plus, Users, X, UserPlus, Trash2,
  ChevronDown, Settings, Shield, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['To Do', 'In Progress', 'Done'];

const CreateTaskModal = ({ members, onClose, onCreate }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', status: 'To Do',
    priority: 'Medium', dueDate: '', assignedTo: ''
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, projectId: id, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      const res = await api.post('/tasks', payload);
      toast.success('Task created!');
      onCreate(res.data.task);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title *</label>
            <input className="input" placeholder="Task title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required minLength={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Task details..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Due Date</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddMemberModal = ({ onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAdd(email, role);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Add Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address</label>
            <input type="email" className="input" placeholder="member@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option>Member</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const isAdmin = project?.members?.some(
    m => m.user._id === user?._id && m.role === 'Admin'
  );

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => {
        setProject(res.data.project);
        setTasks(res.data.tasks);
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Project not found');
        navigate('/projects');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
      toast.success('Task updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddMember = async (email, role) => {
    try {
      const res = await api.post(`/projects/${id}/members`, { email, role });
      setProject(res.data.project);
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
      throw err;
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.project);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        <div className="h-8 bg-slate-100 rounded-lg w-64 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 card animate-pulse bg-slate-50" />)}
        </div>
      </div>
    );
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const statusColors = {
    'To Do': 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Done': 'bg-emerald-100 text-emerald-700'
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link to="/projects" className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mt-0.5">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project?.color }} />
            <h1 className="text-2xl font-bold text-slate-800">{project?.name}</h1>
            {isAdmin && <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={10} /> Admin
            </span>}
          </div>
          {project?.description && <p className="text-slate-500 text-sm mt-1 ml-6">{project.description}</p>}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={() => setShowMembers(!showMembers)} className="btn-secondary text-xs py-2">
            <Users size={14} /> {project?.members?.length} Members
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setShowAddMember(true)} className="btn-secondary text-xs py-2">
                <UserPlus size={14} /> Add Member
              </button>
              <button onClick={() => setShowCreateTask(true)} className="btn-primary text-xs py-2">
                <Plus size={14} /> New Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Members panel */}
      {showMembers && (
        <div className="card p-4 mb-6 animate-slide-up">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Users size={15} /> Team Members
          </h3>
          <div className="flex flex-wrap gap-3">
            {project?.members?.map(m => (
              <div key={m.user._id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=6366f1&fontFamily=Helvetica&fontSize=40&fontWeight=600`}
                  alt={m.user.name} className="w-7 h-7 rounded-full"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{m.user.name}</p>
                  <p className="text-xs text-slate-400">{m.role}</p>
                </div>
                {isAdmin && m.user._id !== user?._id && (
                  <button onClick={() => handleRemoveMember(m.user._id)}
                    className="ml-1 p-0.5 text-slate-300 hover:text-red-500 transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
        {STATUSES.map(status => (
          <div key={status} className="flex flex-col min-h-0">
            <div className={`flex items-center justify-between mb-3 px-1`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>
                  {status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{tasksByStatus[status].length}</span>
              </div>
              {isAdmin && (
                <button onClick={() => setShowCreateTask(true)}
                  className="w-6 h-6 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-3 flex-1 min-h-[200px]">
              {tasksByStatus[status].length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <p className="text-slate-300 text-xs">No tasks</p>
                </div>
              ) : (
                tasksByStatus[status].map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    members={project?.members || []}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateTask && (
        <CreateTaskModal
          members={project?.members || []}
          onClose={() => setShowCreateTask(false)}
          onCreate={task => setTasks(prev => [task, ...prev])}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}
