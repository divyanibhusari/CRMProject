import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { SiteVisit } from '../types.js';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SiteVisitsViewProps {
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SiteVisitsView: React.FC<SiteVisitsViewProps> = ({ triggerToast }) => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<SiteVisit[]>('/sitevisits');
      // Sort visits chronologically (newest date first)
      res.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
      setVisits(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch site visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Completed' | 'Cancelled') => {
    try {
      await apiRequest(`/sitevisits/${id}`, 'PUT', { status });
      triggerToast(`Site visit marked as ${status}! Associated lead moved to appropriate funnel.`, 'success');
      fetchVisits();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update site visit status', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Scheduled Site Visits</h1>
        <p className="text-sm text-slate-500">Track and manage property site visits, physical project inspections, and coordinate transport routes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003A78]"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 p-4 border border-rose-100 text-rose-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{error}</span>
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center space-y-2">
          <MapPin className="w-8 h-8 text-slate-300" />
          <h3 className="font-semibold text-slate-800 text-sm">No site visits scheduled</h3>
          <p className="text-xs text-slate-500">Schedule site visits directly inside the Leads view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visits.map((v) => (
            <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    ID: {v.id.toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(v.status)}`}>
                    {v.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{v.leadName}</h4>
                  <div className="flex items-center gap-1 text-slate-500 font-semibold text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2B86C5]" />
                    {v.projectName}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/50 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date: <strong className="text-slate-800">{v.visitDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time: <strong className="text-slate-800">{v.visitTime}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Coordinator: <strong className="text-slate-700">{v.executiveName}</strong>
                  </div>
                </div>
              </div>

              {v.status === 'Scheduled' && (
                <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                  <button
                    onClick={() => handleUpdateStatus(v.id, 'Completed')}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(v.id, 'Cancelled')}
                    className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
