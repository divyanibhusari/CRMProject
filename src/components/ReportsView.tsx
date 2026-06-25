import React, { useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { Lead, FollowUp, SiteVisit, Booking, Payment } from '../types.js';
import { FileDown, Printer, FileSpreadsheet, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'followups' | 'sitevisits' | 'bookings' | 'revenue'>('leads');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (tab: typeof activeTab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'leads') {
        const res = await apiRequest<Lead[]>('/leads');
        setData(res);
      } else if (tab === 'followups') {
        const res = await apiRequest<FollowUp[]>('/followups');
        setData(res);
      } else if (tab === 'sitevisits') {
        const res = await apiRequest<SiteVisit[]>('/sitevisits');
        setData(res);
      } else if (tab === 'bookings') {
        const res = await apiRequest<Booking[]>('/bookings');
        setData(res);
      } else if (tab === 'revenue') {
        const res = await apiRequest<Payment[]>('/payments');
        setData(res);
      }
      setActiveTab(tab);
    } catch (err: any) {
      setError(err.message || 'Failed to pull report records');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReport(activeTab);
  }, [activeTab]);

  // Export to CSV helper
  const handleExportCSV = () => {
    if (data.length === 0) return;

    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers
          .map(fieldName => {
            const val = row[fieldName];
            const cleanVal = val === undefined || val === null ? '' : String(val).replace(/"/g, '""');
            return `"${cleanVal}"`;
          })
          .join(',')
      )
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VIP_Project_${activeTab}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Reports & Export Centre</h1>
          <p className="text-sm text-slate-500">Aggregate corporate CRM metrics, compile legal plot bookings history and export to spreadsheets.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => loadReport(activeTab)}
            title="Refresh Report Data"
            className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={data.length === 0}
            className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 gap-1 overflow-x-auto">
        {(['leads', 'followups', 'sitevisits', 'bookings', 'revenue'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === tab
                ? 'border-[#003A78] text-[#003A78]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            {tab} report
          </button>
        ))}
      </div>

      {/* Report rendering area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 p-4 border border-rose-100 text-rose-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{error}</span>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 italic">No records to load.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'leads' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Project Interest</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Executive</th>
                    <th className="p-3">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {data.map((l: Lead) => (
                    <tr key={l.id}>
                      <td className="p-3 font-semibold text-slate-900">{l.name}</td>
                      <td className="p-3 font-mono">+91 {l.mobile}</td>
                      <td className="p-3">{l.projectInterest}</td>
                      <td className="p-3">{l.source}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3">{l.assignedExecutiveName || '-'}</td>
                      <td className="p-3 text-slate-400">{new Date(l.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'followups' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Lead Name</th>
                    <th className="p-3">Executive Name</th>
                    <th className="p-3">Remark Note</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Follow-Up Date</th>
                    <th className="p-3">Next Scheduled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data.map((f: FollowUp) => (
                    <tr key={f.id}>
                      <td className="p-3 font-semibold text-slate-900">{f.leadName}</td>
                      <td className="p-3">{f.executiveName}</td>
                      <td className="p-3 italic max-w-xs truncate" title={f.remark}>"{f.remark}"</td>
                      <td className="p-3">{f.type}</td>
                      <td className="p-3">{f.followUpDate}</td>
                      <td className="p-3 font-semibold text-amber-600">{f.nextFollowUpDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'sitevisits' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Project Site</th>
                    <th className="p-3">Visit Date</th>
                    <th className="p-3">Visit Time</th>
                    <th className="p-3">Coordinator</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data.map((v: SiteVisit) => (
                    <tr key={v.id}>
                      <td className="p-3 font-semibold text-slate-900">{v.leadName}</td>
                      <td className="p-3 font-semibold">{v.projectName}</td>
                      <td className="p-3">{v.visitDate}</td>
                      <td className="p-3">{v.visitTime}</td>
                      <td className="p-3">{v.executiveName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'bookings' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Customer</th>
                    <th className="p-3">Project Name</th>
                    <th className="p-3 font-mono">Plot Unit</th>
                    <th className="p-3 text-right">Agreement Value</th>
                    <th className="p-3 text-right">Downpayment Token</th>
                    <th className="p-3">Booking Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data.map((b: Booking) => (
                    <tr key={b.id}>
                      <td className="p-3 font-bold text-slate-900">{b.customerName}</td>
                      <td className="p-3">{b.projectName}</td>
                      <td className="p-3 font-mono font-bold">{b.plotNumber}</td>
                      <td className="p-3 text-right font-mono">₹{Number(b.agreementValue || 0).toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-emerald-700">₹{Number(b.bookingAmount || 0).toLocaleString()}</td>
                      <td className="p-3">{b.bookingDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'revenue' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Receipt Number</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Project Details</th>
                    <th className="p-3">Transaction Mode</th>
                    <th className="p-3 text-right">Cleared Amount</th>
                    <th className="p-3">Date Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data.map((p: Payment) => (
                    <tr key={p.id}>
                      <td className="p-3 font-mono font-bold text-slate-500">{p.receiptNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{p.customerName}</td>
                      <td className="p-3">{p.projectName} - Plot {p.plotNumber}</td>
                      <td className="p-3">{p.mode}</td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-bold">₹{Number(p.amount || 0).toLocaleString()}</td>
                      <td className="p-3">{p.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
