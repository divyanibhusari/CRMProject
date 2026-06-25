import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import { FollowUp } from '../types.js';
import { Phone, MessageSquare, Mail, Users, AlertCircle, Calendar } from 'lucide-react';

export const FollowUpsView: React.FC = () => {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<FollowUp[]>('/followups');
      // Sort by newest next follow up date first
      res.sort((a, b) => new Date(b.nextFollowUpDate).getTime() - new Date(a.nextFollowUpDate).getTime());
      setFollowups(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch follow-ups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4 text-[#2B86C5]" />;
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-rose-500" />;
      default:
        return <Users className="w-4 h-4 text-[#003A78]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Follow-Ups Timetable</h1>
        <p className="text-sm text-slate-500">Track scheduled customer touchpoints, WhatsApp messages, office meetings, and follow-up reminders.</p>
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
      ) : followups.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center space-y-2">
          <Phone className="w-8 h-8 text-slate-300" />
          <h3 className="font-semibold text-slate-800 text-sm">No follow-ups recorded</h3>
          <p className="text-xs text-slate-500">Log follow-up remarks directly inside the Leads view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followups.map((f) => {
            const isOverdue = new Date(f.nextFollowUpDate).getTime() < Date.now() - 3600000 * 24;
            return (
              <div key={f.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#003A78] uppercase tracking-wider font-mono bg-slate-100 px-2 py-1 rounded">
                      {getTypeIcon(f.type)}
                      {f.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOverdue ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      Next: {f.nextFollowUpDate}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{f.leadName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Assigned rep: {f.executiveName}</p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100/50 leading-relaxed italic">
                    "{f.remark}"
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 border-t border-slate-50 pt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Recorded on: {new Date(f.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
