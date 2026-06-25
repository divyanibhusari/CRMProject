import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { User, UserRole } from '../types.js';
import { ShieldAlert, Plus, UserPlus, ToggleLeft, Shield, ToggleRight, Mail, AlertCircle } from 'lucide-react';

interface UsersViewProps {
  currentUser: { id: string; role: string } | null;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ currentUser, triggerToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Sales Executive' as UserRole,
    password: 'password123'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<User[]>('/users');
      setUsers(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.name || !form.email || !form.password) {
      triggerToast('All fields are required', 'error');
      return;
    }

    try {
      await apiRequest('/users', 'POST', form);
      triggerToast(`Account for "${form.name}" registered successfully!`, 'success');
      setShowAddModal(false);
      setForm({
        username: '',
        name: '',
        email: '',
        role: 'Sales Executive',
        password: 'password123'
      });
      fetchUsers();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to add user account', 'error');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiRequest(`/users/${userId}`, 'PUT', { status: nextStatus });
      triggerToast(`Account status updated to "${nextStatus}"`, 'success');
      fetchUsers();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to change status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Users & RBAC Controls</h1>
          <p className="text-sm text-slate-500">Configure corporate team structures, assign access roles, and audit account states.</p>
        </div>
        {currentUser && ['Super Admin', 'Admin'].includes(currentUser.role) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            Add CRM User
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Name & Username</th>
                  <th className="p-4">Email ID</th>
                  <th className="p-4">Access Role Tier</th>
                  <th className="p-4">Date Registered</th>
                  <th className="p-4">Status</th>
                  {currentUser && ['Super Admin', 'Admin'].includes(currentUser.role) && (
                    <th className="p-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">@{u.username}</div>
                    </td>
                    <td className="p-4 text-slate-600 flex items-center gap-1.5 mt-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {u.email}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-[#003A78] text-[10px] font-extrabold rounded-md flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3 text-[#2B86C5]" />
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    {currentUser && ['Super Admin', 'Admin'].includes(currentUser.role) && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`text-xs font-bold transition-colors ${
                            u.status === 'Active' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Register employee account */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Add CRM User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="e.g. Vikram Singh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="e.g. vikram_singh"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Access Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Telecaller">Telecaller</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="name@vipproject.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                <input
                  type="text"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="password123"
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
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
