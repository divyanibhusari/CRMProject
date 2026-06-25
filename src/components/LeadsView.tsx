import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Check,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { apiRequest } from '../utils/api.js';
import { Lead, User, Project, LeadStatus, LeadSource } from '../types.js';

interface LeadsViewProps {
  currentUser: { id: string; role: string; name: string } | null;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ currentUser, triggerToast }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [executives, setExecutives] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    mobile: '',
    email: '',
    city: 'Nagpur',
    state: 'Maharashtra',
    budget: '',
    projectInterest: '',
    source: 'Manual Entry' as LeadSource,
    notes: '',
    assignedExecutiveId: '',
    manualComment: ''
  });

  const [followForm, setFollowForm] = useState({
    remark: '',
    nextFollowUpDate: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0],
    type: 'Call'
  });

  const [visitForm, setVisitForm] = useState({
    projectId: '',
    visitDate: new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0],
    visitTime: '11:00 AM'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const leadsData = await apiRequest<Lead[]>('/leads');
      setLeads(leadsData);

      // Fetch active projects
      const projectsData = await apiRequest<Project[]>('/projects');
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setNewLeadForm(prev => ({ ...prev, projectInterest: projectsData[0].name }));
        setVisitForm(prev => ({ ...prev, projectId: projectsData[0].id }));
      }

      // Fetch executives for assignment (for Super Admin / Admin / Sales Manager)
      if (currentUser && ['Super Admin', 'Admin', 'Sales Manager'].includes(currentUser.role)) {
        const usersData = await apiRequest<User[]>('/users');
        const activeExecs = usersData.filter(u => u.status === 'Active' && (u.role === 'Sales Executive' || u.role === 'Telecaller'));
        setExecutives(activeExecs);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load lead resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle manual lead registration
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.mobile) {
      triggerToast('Lead name and mobile are required', 'error');
      return;
    }
    try {
      await apiRequest('/leads', 'POST', newLeadForm);
      triggerToast('Lead created and synchronized successfully!', 'success');
      setShowAddModal(false);
      // Reset
      setNewLeadForm({
        name: '',
        mobile: '',
        email: '',
        city: 'Nagpur',
        state: 'Maharashtra',
        budget: '',
        projectInterest: projects[0]?.name || '',
        source: 'Manual Entry',
        notes: '',
        assignedExecutiveId: '',
        manualComment: ''
      });
      loadData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to add lead', 'error');
    }
  };

  // Trigger follow up logging
  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    if (!followForm.remark || !followForm.nextFollowUpDate) {
      triggerToast('Remark and next follow up date are required', 'error');
      return;
    }
    try {
      await apiRequest('/followups', 'POST', {
        leadId: activeLead.id,
        remark: followForm.remark,
        nextFollowUpDate: followForm.nextFollowUpDate,
        type: followForm.type
      });
      triggerToast('Follow-up activity recorded and notification scheduled!', 'success');
      setShowFollowModal(false);
      setFollowForm({
        remark: '',
        nextFollowUpDate: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0],
        type: 'Call'
      });
      loadData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to schedule follow up', 'error');
    }
  };

  // Trigger site visit scheduling
  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    if (!visitForm.projectId || !visitForm.visitDate || !visitForm.visitTime) {
      triggerToast('Project, date, and time are required', 'error');
      return;
    }
    try {
      const response = await apiRequest('/sitevisits', 'POST', {
        leadId: activeLead.id,
        projectId: visitForm.projectId,
        visitDate: visitForm.visitDate,
        visitTime: visitForm.visitTime
      });

      triggerToast('Site visit scheduled! Google Calendar synchronized & WhatsApp sent.', 'success');
      setShowVisitModal(false);
      loadData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to schedule site visit', 'error');
    }
  };

  // Inline Quick Reassignment
  const handleReassign = async (leadId: string, execId: string) => {
    try {
      await apiRequest(`/leads/${leadId}`, 'PUT', { assignedExecutiveId: execId });
      triggerToast('Lead re-assigned and alerts dispatched successfully', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message || 'Re-assignment failed', 'error');
    }
  };

  // Inline Status Change
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await apiRequest(`/leads/${leadId}`, 'PUT', { status: newStatus });
      triggerToast(`Lead status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Filter application
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.mobile.includes(searchTerm) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.projectInterest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? lead.status === statusFilter : true;
    const matchesSource = sourceFilter ? lead.source === sourceFilter : true;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'Contacted':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
      case 'Follow Up':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Interested':
        return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'Site Visit Scheduled':
        return 'bg-pink-50 text-pink-700 border border-pink-100';
      case 'Negotiation':
        return 'bg-orange-50 text-orange-700 border border-orange-100';
      case 'Booked':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Lost':
        return 'bg-slate-50 text-slate-500 border border-slate-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Leads Registry</h1>
          <p className="text-sm text-slate-500">Capture, assign, nurture and monitor project inquiries and conversions.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          Add Manual Lead
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, city, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#003A78]"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Interested">Interested</option>
            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Booked">Booked</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="w-full md:w-48">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#003A78]"
          >
            <option value="">All Lead Sources</option>
            <option value="99acres">99acres</option>
            <option value="Website Form">Website Form</option>
            <option value="Landing Page">Landing Page</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Manual Entry">Manual Entry</option>
          </select>
        </div>
      </div>

      {/* Main CRM Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300" />
          <h3 className="font-semibold text-slate-800">No leads found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Prospect details</th>
                  <th className="p-4">Interest & Budget</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Representative</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3 text-slate-400" /> +91 {lead.mobile}
                      </div>
                      {lead.email && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" /> {lead.email}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase font-mono bg-slate-100 px-1 py-0.5 rounded inline-block">
                        {lead.city}, {lead.state}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{lead.projectInterest}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Budget: {lead.budget}</div>
                      {lead.notes && (
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic max-w-xs" title={lead.notes}>
                          "{lead.notes}"
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2.5 rounded-full outline-none ${getStatusBadge(lead.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Interested">Interested</option>
                        <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Booked">Booked</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {currentUser && ['Super Admin', 'Admin', 'Sales Manager'].includes(currentUser.role) ? (
                        <select
                          value={lead.assignedExecutiveId || ''}
                          onChange={(e) => handleReassign(lead.id, e.target.value)}
                          className="border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                        >
                          <option value="">Unassigned</option>
                          {executives.map((exec) => (
                            <option key={exec.id} value={exec.id}>
                              {exec.name} ({exec.role})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                          {lead.assignedExecutiveName || <span className="text-slate-400 font-normal italic">Not Assigned</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Call Follow Up Button */}
                        <button
                          onClick={() => {
                            setActiveLead(lead);
                            setShowFollowModal(true);
                          }}
                          title="Record Phone Follow Up"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-all"
                        >
                          <Phone className="w-4 h-4" />
                        </button>

                        {/* Schedule Site Visit Button */}
                        <button
                          onClick={() => {
                            setActiveLead(lead);
                            setShowVisitModal(true);
                          }}
                          title="Schedule Real Estate Site Visit"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Manual Lead */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Register Premium Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleAddLead} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                    placeholder="e.g. Anil Deshmukh"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.mobile}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, mobile: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email ID</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                    placeholder="name@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Budget Specification</label>
                  <input
                    type="text"
                    value={newLeadForm.budget}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                    placeholder="e.g. ₹40 Lakhs - ₹50 Lakhs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project Interest</label>
                  <select
                    value={newLeadForm.projectInterest}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, projectInterest: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                  >
                    <option value="">General Inquiry</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lead Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as LeadSource })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                  >
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                  </select>
                </div>
              </div>

              {currentUser && ['Super Admin', 'Admin', 'Sales Manager'].includes(currentUser.role) && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assign Direct Executive</label>
                  <select
                    value={newLeadForm.assignedExecutiveId}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedExecutiveId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                  >
                    <option value="">Unassigned (Status: New)</option>
                    {executives.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Requirement Notes</label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                  placeholder="Specific requirements, plot coordinates, payment requests, preferences..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Manual Lead Comment / First Remark</label>
                <textarea
                  value={newLeadForm.manualComment}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, manualComment: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                  placeholder="Enter any initial comments, customer feedback, call summary, or special remarks here..."
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
                  Save Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Follow Up Remark */}
      {showFollowModal && activeLead && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Record Follow-Up: {activeLead.name}</h3>
              <button onClick={() => setShowFollowModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleAddFollowUp} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Follow-Up Channel</label>
                  <select
                    value={followForm.type}
                    onChange={(e) => setFollowForm({ ...followForm, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Meeting">Office / Site Meeting</option>
                    <option value="Email">Email Pitch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    required
                    value={followForm.nextFollowUpDate}
                    onChange={(e) => setFollowForm({ ...followForm, nextFollowUpDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Conversation Remarks *</label>
                <textarea
                  required
                  value={followForm.remark}
                  onChange={(e) => setFollowForm({ ...followForm, remark: e.target.value })}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none placeholder-slate-400 focus:ring-1 focus:ring-[#003A78]"
                  placeholder="Record summary of conversation, demands, budget queries..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFollowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Save Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Schedule Site Visit */}
      {showVisitModal && activeLead && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Schedule Site Visit: {activeLead.name}</h3>
              <button onClick={() => setShowVisitModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleScheduleVisit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Property Project *</label>
                <select
                  required
                  value={visitForm.projectId}
                  onChange={(e) => setVisitForm({ ...visitForm, projectId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Visit Time *</label>
                  <input
                    type="text"
                    required
                    value={visitForm.visitTime}
                    onChange={(e) => setVisitForm({ ...visitForm, visitTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="e.g. 11:30 AM"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-2.5 border border-slate-100">
                <Clock className="w-4 h-4 text-[#003A78] shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  Scheduling will trigger automated sync with **Google Calendar** of the assigned representative and send layout maps dispatch on **WhatsApp** (+91 {activeLead.mobile}).
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Schedule Site Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
