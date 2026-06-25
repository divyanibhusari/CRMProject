import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api.js';
import {
  Settings,
  RefreshCw,
  Cpu,
  Power,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
  Sparkles,
  Link,
  ShieldAlert
} from 'lucide-react';

interface SyncerStatus {
  active: boolean;
  apiUrl: string;
  apiKeyConfigured: boolean;
  logs: string[];
}

interface SettingsViewProps {
  triggerToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ triggerToast }) => {
  const [status, setStatus] = useState<SyncerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Simulated templates form
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Hello {{customer_name}}, your site visit for project {{project_name}} has been confirmed for {{visit_date}} at {{visit_time}}. Regards, VIP Project Team.'
  );
  const [gcalConnected, setGcalConnected] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<SyncerStatus>('/integration/99acres/status');
      setStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const res = await apiRequest('/integration/99acres/sync', 'POST');
      triggerToast(`99acres manual sync complete! Added ${res.addedCount} new leads.`, 'success');
      fetchStatus();
    } catch (err: any) {
      triggerToast(err.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSync = async () => {
    try {
      const res = await apiRequest('/integration/99acres/toggle', 'POST');
      triggerToast(res.message, 'info');
      fetchStatus();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to toggle sync', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Integrations & Sync Control</h1>
        <p className="text-sm text-slate-500 font-medium">Configure property listing portal leads sync APIs, WhatsApp template triggers and Google Calendar syncs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 99acres Sync Portal controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#003A78]" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">99acres Integration Service</h3>
              </div>
              {status && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  status.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {status.active ? 'Background Cron Active' : 'Cron Paused'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">API Endpoint URI</span>
                <code className="block text-slate-700 font-mono select-all bg-white p-1 rounded border border-slate-100 truncate">
                  {status?.apiUrl}
                </code>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">API Authentication credentials</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Configured from Environment (.env)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="px-4 py-2 bg-[#003A78] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronizing Leads...' : 'Force Manual Pull'}
              </button>
              <button
                onClick={handleToggleSync}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5 text-slate-500" />
                {status?.active ? 'Deactivate Background Syncer' : 'Activate Background Syncer'}
              </button>
            </div>
          </div>

          {/* Sync logs ticker */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-50">99acres Sync Transaction Log</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#003A78]"></div>
                </div>
              ) : status?.logs.map((log, i) => (
                <div key={i} className="font-mono text-[11px] bg-slate-50 p-2 rounded text-slate-600 border border-slate-100 flex items-start gap-2">
                  <span className="text-[#2B86C5] shrink-0 font-bold">●</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: simulated whatsapp templates & calendar sync */}
        <div className="space-y-6">
          {/* WhatsApp template config */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">WhatsApp Template Layout</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Interactive Site Visit Confirmation Template</label>
                <textarea
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 leading-normal focus:outline-none"
                />
              </div>

              <button
                onClick={() => triggerToast('WhatsApp messaging templates saved!', 'success')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors text-center"
              >
                Save Dispatch Templates
              </button>
            </div>
          </div>

          {/* Google calendar authorization simulator */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <Calendar className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Google Calendar Synchronization</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-500 leading-normal">
                Synchronize appointment slots, corporate site visits and follow-up schedules automatically inside representative calendar accounts.
              </p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 font-bold block">VIP Corporate Account</strong>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">authorized_user@vipproject.com</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded-full border border-emerald-100 shrink-0">
                  Linked
                </span>
              </div>

              <button
                onClick={() => {
                  setGcalConnected(!gcalConnected);
                  triggerToast(gcalConnected ? 'Google Calendar credentials unlinked' : 'Google Calendar authenticated successfully!', 'info');
                }}
                className={`w-full py-2 text-center font-bold rounded-lg transition-colors ${
                  gcalConnected
                    ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                }`}
              >
                {gcalConnected ? 'Disconnect Calendar accounts' : 'Authorize Google Workspace GCal'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
