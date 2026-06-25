import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { Project, ProjectType, ProjectStatus } from '../types.js';
import { Plus, Home, MapPin, BadgePercent, LayoutGrid, Check, PlusCircle, Sparkles } from 'lucide-react';

interface ProjectsViewProps {
  currentUser: { role: string } | null;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ currentUser, triggerToast }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: '',
    location: '',
    type: 'Plot' as ProjectType,
    description: '',
    priceRange: '',
    plotSizes: '',
    amenities: '',
    gallery: '',
    status: 'Upcoming' as ProjectStatus
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<Project[]>('/projects');
      setProjects(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.priceRange) {
      triggerToast('Name, Location, and Price range are required', 'error');
      return;
    }

    try {
      const amenitiesList = form.amenities ? form.amenities.split(',').map(a => a.trim()) : [];
      const galleryList = form.gallery ? form.gallery.split(',').map(g => g.trim()) : [
        'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80'
      ];

      await apiRequest('/projects', 'POST', {
        ...form,
        amenities: amenitiesList,
        gallery: galleryList
      });

      triggerToast('New property project added successfully!', 'success');
      setShowAddModal(false);
      // Reset
      setForm({
        name: '',
        location: '',
        type: 'Plot',
        description: '',
        priceRange: '',
        plotSizes: '',
        amenities: '',
        gallery: '',
        status: 'Upcoming'
      });
      fetchProjects();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to add project', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">VIP Projects Portfolio</h1>
          <p className="text-sm text-slate-500">Showcase, configure and audit commercial plot layouts, agricultural farmlands and residential complexes.</p>
        </div>
        {currentUser && ['Super Admin', 'Admin'].includes(currentUser.role) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            Add Property Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 italic">No projects registered.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={p.gallery[0] || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80'}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                      {p.type}
                    </span>
                    <span className={`px-2.5 py-0.5 text-white text-[10px] font-bold rounded-full ${
                      p.status === 'Ongoing' ? 'bg-[#2B86C5]' : p.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {p.location}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-normal line-clamp-3">
                    {p.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Price range</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{p.priceRange}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Sizes available</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{p.plotSizes}</strong>
                    </div>
                  </div>

                  {p.amenities.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Amenities Included</span>
                      <div className="flex flex-wrap gap-1">
                        {p.amenities.map(a => (
                          <span key={a} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-semibold rounded border border-slate-100">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[10px] font-mono text-slate-400">Created: {new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Register property project */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Add Property Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                    placeholder="e.g. VIP Orchid Greens"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                    placeholder="e.g. Airport Road, Nagpur"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ProjectType })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Plot">Plot Sales</option>
                    <option value="Residential">Residential Townhouse</option>
                    <option value="Investment">Investment Farms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Development Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Upcoming">Upcoming Launch</option>
                    <option value="Ongoing">Ongoing Construction</option>
                    <option value="Completed">Completed / Sold out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price Range *</label>
                  <input
                    type="text"
                    required
                    value={form.priceRange}
                    onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="e.g. ₹35 Lakhs - ₹75 Lakhs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plot Sizes</label>
                  <input
                    type="text"
                    value={form.plotSizes}
                    onChange={(e) => setForm({ ...form, plotSizes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="e.g. 1200 - 2400 sq.ft."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="e.g. Clubhouse, 24/7 Security, Swimming Pool"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project Image URL (Optional)</label>
                <input
                  type="text"
                  value={form.gallery}
                  onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="Summarize architectural, approvals and location benefits..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
