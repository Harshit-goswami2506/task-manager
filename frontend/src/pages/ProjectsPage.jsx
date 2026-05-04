import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, FolderKanban, Users, ArrowRight, Trash2, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'
];

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      toast.success('Project created!');
      onCreate(res.data.project);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Project Name *</label>
            <input className="input" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required minLength={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What is this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(color => (
                <button key={color} type="button"
                  onClick={() => setForm({ ...form, color })}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-40 animate-pulse bg-slate-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-500">No projects yet</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const userMember = project.members?.find(m => m.user);
            const isAdmin = project.members?.some(m => m.role === 'Admin');
            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card p-5 hover:shadow-md transition-all duration-200 group block animate-slide-up"
              >
                {/* Color strip */}
                <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: project.color }} />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-base truncate group-hover:text-primary-600 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(project._id, e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400" />
                    <span className="text-xs text-slate-500">{project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 4).map(m => (
                      <img
                        key={m.user._id}
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=6366f1&fontFamily=Helvetica&fontSize=40&fontWeight=600`}
                        alt={m.user.name}
                        title={`${m.user.name} (${m.role})`}
                        className="w-6 h-6 rounded-full border-2 border-white"
                      />
                    ))}
                    {project.members?.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-medium">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-2 text-primary-600 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-xs font-medium">Open project</span>
                  <ArrowRight size={12} className="ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
