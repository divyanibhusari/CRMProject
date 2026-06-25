import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { Payment, Booking, PaymentMode } from '../types.js';
import { Plus, IndianRupee, CreditCard, Receipt, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentsViewProps {
  currentUser: { role: string } | null;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ currentUser, triggerToast }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    bookingId: '',
    amount: '',
    mode: 'UPI' as PaymentMode,
    receiptNumber: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const payRes = await apiRequest<Payment[]>('/payments');
      setPayments(payRes);
      const bookRes = await apiRequest<Booking[]>('/bookings');
      setBookings(bookRes.filter(b => b.status === 'Confirmed'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bookingId || !form.amount || !form.mode) {
      triggerToast('Booking reference, amount, and mode are required', 'error');
      return;
    }

    try {
      await apiRequest('/payments', 'POST', form);
      triggerToast('Collection receipt registered successfully!', 'success');
      setShowAddModal(false);
      setForm({
        bookingId: '',
        amount: '',
        mode: 'UPI',
        receiptNumber: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      fetchPayments();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to register payment', 'error');
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Payments & Receipts Ledger</h1>
          <p className="text-sm text-slate-500">Document downpayments, installation dues, verify transaction mode clearances and print receipts.</p>
        </div>
        {currentUser && ['Super Admin', 'Admin', 'Sales Manager'].includes(currentUser.role) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            Issue Collection Receipt
          </button>
        )}
      </div>

      {/* KPI Stats Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Collections Cleared</span>
            <strong className="text-xl font-extrabold text-slate-900">₹{Number(totalCollected || 0).toLocaleString()}</strong>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#003A78]">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Receipts Generated</span>
            <strong className="text-xl font-extrabold text-slate-900">{payments.length} VIP Receipts</strong>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 italic">No payments logged.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Receipt Number</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Project / Plot</th>
                  <th className="p-4">Payment Mode</th>
                  <th className="p-4 text-right">Cleared Amount</th>
                  <th className="p-4">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-500">{p.receiptNumber}</td>
                    <td className="p-4 font-semibold text-slate-950">{p.customerName}</td>
                    <td className="p-4 font-medium text-slate-700">{p.projectName} - Plot {p.plotNumber}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                        {p.mode}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-700 font-bold">₹{Number(p.amount || 0).toLocaleString()}</td>
                    <td className="p-4 text-slate-500 font-semibold">{p.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Issue Collection Receipt */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Issue Collection Receipt</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreatePayment} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Booking Reference *</label>
                <select
                  required
                  value={form.bookingId}
                  onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                >
                  <option value="">-- Choose Booking --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.customerName} - {b.projectName} (Plot {b.plotNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cleared Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Mode *</label>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value as PaymentMode })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Cash">Physical Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Receipt Number (Optional)</label>
                  <input
                    type="text"
                    value={form.receiptNumber}
                    onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="VIP/REC/..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
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
                  Register Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
