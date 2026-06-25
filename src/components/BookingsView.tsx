import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { Booking, Project } from '../types.js';
import { Plus, CheckCircle, Clock, XCircle, AlertCircle, Sparkles, Receipt } from 'lucide-react';

interface BookingsViewProps {
  currentUser: { role: string } | null;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({ currentUser, triggerToast }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    projectId: '',
    plotNumber: '',
    bookingAmount: '',
    agreementValue: '',
    bookingDate: new Date().toISOString().split('T')[0]
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<Booking[]>('/bookings');
      setBookings(res);
      const projRes = await apiRequest<Project[]>('/projects');
      setProjects(projRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.projectId || !form.plotNumber || !form.bookingAmount || !form.agreementValue) {
      triggerToast('Please complete all booking fields', 'error');
      return;
    }

    try {
      await apiRequest('/bookings', 'POST', form);
      triggerToast('Plot booking created successfully! Receipt generated.', 'success');
      setShowAddModal(false);
      setForm({
        customerName: '',
        projectId: '',
        plotNumber: '',
        bookingAmount: '',
        agreementValue: '',
        bookingDate: new Date().toISOString().split('T')[0]
      });
      fetchBookings();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to record booking', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Bookings Registry</h1>
          <p className="text-sm text-slate-500">Record and monitor property allocations, unit selections and downpayments.</p>
        </div>
        {currentUser && ['Super Admin', 'Admin', 'Sales Manager'].includes(currentUser.role) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            Book Plot Unit
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 italic">No bookings recorded.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Property Project</th>
                  <th className="p-4 font-mono">Plot/Unit ID</th>
                  <th className="p-4 text-right">Agreement Value</th>
                  <th className="p-4 text-right">Downpayment Amount</th>
                  <th className="p-4">Booking Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-950">{b.customerName}</td>
                    <td className="p-4 font-medium text-slate-700">{b.projectName}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">{b.plotNumber}</td>
                    <td className="p-4 text-right font-mono font-semibold">₹{Number(b.agreementValue || 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-emerald-700 font-semibold">₹{Number(b.bookingAmount || 0).toLocaleString()}</td>
                    <td className="p-4 text-slate-500 font-medium">{b.bookingDate}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Record unit booking */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Book Property Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  placeholder="e.g. Sunita Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Project *</label>
                  <select
                    required
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plot/Unit Number *</label>
                  <input
                    type="text"
                    required
                    value={form.plotNumber}
                    onChange={(e) => setForm({ ...form, plotNumber: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="e.g. G-15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Agreement Value *</label>
                  <input
                    type="number"
                    required
                    value={form.agreementValue}
                    onChange={(e) => setForm({ ...form, agreementValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="Total layout cost in ₹"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Downpayment Amount *</label>
                  <input
                    type="number"
                    required
                    value={form.bookingAmount}
                    onChange={(e) => setForm({ ...form, bookingAmount: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="Booking token in ₹"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Booking Date *</label>
                <input
                  type="date"
                  required
                  value={form.bookingDate}
                  onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
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
                  Confirm Unit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
