import React, { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  PhoneCall,
  MapPin,
  CheckCircle,
  IndianRupee,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { apiRequest } from '../utils/api.js';

interface DashboardData {
  cards: {
    totalLeads: number;
    todayLeads: number;
    activeFollowUps: number;
    siteVisits: number;
    bookings: number;
    revenue: number;
  };
  leadSourceAnalysis: { name: string; value: number }[];
  monthlyLeads: { name: string; leads: number }[];
  executivePerformance: { name: string; leadsAssigned: number; bookings: number; followups: number }[];
  conversionRatio: { name: string; value: number }[];
  revenueAnalytics: { name: string; amount: number }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
}

const COLORS = ['#003A78', '#2B86C5', '#F59E0B', '#C23A4A', '#10B981', '#6366F1'];

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<DashboardData>('/dashboard/analytics');
      setData(res);
      
      try {
        const logsRes = await apiRequest<AuditLog[]>('/auditlogs');
        setLogs(logsRes.slice(0, 6)); // top 6 logs
      } catch (logErr) {
        console.warn('Could not fetch audit logs:', logErr);
        setLogs([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#003A78]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold">Unable to load dashboard analytical details</p>
          <p className="text-xs">{error || 'Please ensure database connection is intact'}</p>
        </div>
      </div>
    );
  }

  const { cards, leadSourceAnalysis, monthlyLeads, executivePerformance, conversionRatio, revenueAnalytics } = data;

  return (
    <div className="space-y-6 animate-fade-in selection:bg-[#003A78] selection:text-white">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-blue-50 text-[#003A78] uppercase border border-blue-100">
              Live Operations Panel
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">
              June 2026
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">VIP Project CRM Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time sales performance metrics, pipeline visibility, and analytical logs.</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 self-start hover:scale-[1.02] active:scale-[0.98]"
        >
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          Refresh Pipeline
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-blue-600 border-y border-r border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#003A78]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cards.totalLeads}</h3>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-md w-fit">
              <TrendingUp className="w-3 h-3" />
              Active Funnel
            </span>
          </div>
        </div>

        {/* Card 2: Today's Leads */}
        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-orange-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Leads</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cards.todayLeads}</h3>
            <span className="text-[9px] text-slate-500 font-bold mt-1 block bg-slate-50 px-1.5 py-0.5 rounded-md w-fit">
              New Inquiries
            </span>
          </div>
        </div>

        {/* Card 3: Active Follow Ups */}
        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active FollowUps</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cards.activeFollowUps}</h3>
            <span className="text-[9px] text-amber-700 font-bold mt-1 block bg-amber-50 px-1.5 py-0.5 rounded-md w-fit">
              Pending Calls
            </span>
          </div>
        </div>

        {/* Card 4: Site Visits */}
        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-rose-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Visits</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cards.siteVisits}</h3>
            <span className="text-[9px] text-rose-700 font-bold block mt-1 bg-rose-50 px-1.5 py-0.5 rounded-md w-fit">
              Scheduled
            </span>
          </div>
        </div>

        {/* Card 5: Bookings */}
        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cards.bookings}</h3>
            <span className="text-[9px] text-emerald-700 font-bold block mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-md w-fit">
              Plots Allocated
            </span>
          </div>
        </div>

        {/* Card 6: Revenue Collections */}
        <div className="bg-[#003A78] p-4 rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold leading-tight tracking-tight text-white">
              ₹{(() => {
                const revenueVal = cards?.revenue ?? 0;
                return revenueVal >= 100000 
                  ? `${(revenueVal / 100000).toFixed(2)}L` 
                  : Number(revenueVal).toLocaleString();
              })()}
            </h3>
            <span className="text-[9px] text-emerald-300 font-bold block mt-1 bg-white/10 px-1.5 py-0.5 rounded-md w-fit">
              Collections Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monthly Trends & funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Lead Inquiries & Conversions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Lead Acquisition & Sales Trend</h3>
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 font-mono text-[9px] font-semibold rounded-md border border-slate-100">Monthly breakdown</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyLeads}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    labelStyle={{ fontWeight: 'bold', color: '#94A3B8' }}
                    formatter={(value) => [`${value} Leads`, 'Acquisition']} 
                  />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="leads" stroke="#2B86C5" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} name="Monthly Leads Acquired" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Performance Stats */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Executive Performance Index</h3>
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 font-mono text-[9px] font-semibold rounded-md border border-slate-100">Agent efficiency metrics</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executivePerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="leadsAssigned" fill="#2B86C5" name="Leads Assigned" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar dataKey="followups" fill="#F59E0B" name="Follow-Ups Completed" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar dataKey="bookings" fill="#10B981" name="Bookings Completed" radius={[6, 6, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Lead Sources & funnels */}
        <div className="space-y-6">
          {/* Lead Source Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Lead Source Analysis</h3>
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 font-mono text-[9px] font-semibold rounded-md border border-slate-100">Distribution</span>
            </div>
            <div className="h-56 flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {leadSourceAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    formatter={(value) => [`${value} Leads`, 'Count']} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                <span className="text-lg font-black text-slate-800">
                  {leadSourceAnalysis.reduce((acc, curr) => acc + (curr.value || 0), 0)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs w-full mt-4 pt-4 border-t border-slate-50">
              {leadSourceAnalysis.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100/50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-slate-600 truncate text-[11px] font-medium">{entry.name}</span>
                  </div>
                  <span className="text-slate-900 font-bold text-[11px] ml-1 shrink-0">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Funnel Metrics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Conversion Stages</h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold rounded-md">Efficiency</span>
            </div>
            <div className="space-y-4">
              {conversionRatio.map((stage, i) => {
                const max = conversionRatio[0]?.value || 100;
                const percentage = Math.round((stage.value / max) * 100);
                return (
                  <div key={stage.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="text-[11px] font-semibold text-slate-600">{stage.name}</span>
                      <span className="font-mono text-slate-800">{stage.value} <span className="text-slate-400 text-[10px]">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#2B86C5] to-[#003A78] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Ticker & Revenue Area Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Progress Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Weekly Collection Revenue</h3>
            <span className="px-2 py-0.5 bg-[#003A78] text-white font-mono text-[9px] font-bold rounded-md">Cleared Receipts</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueAnalytics}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003A78" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#003A78" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }}
                  formatter={(value) => [`₹${Number(value || 0).toLocaleString()}`, 'Amount']} 
                />
                <Area type="monotone" dataKey="amount" stroke="#003A78" strokeWidth={3.5} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue Received" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Log Security Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">System Audit Logs</h3>
              <span className="px-2 py-0.5 bg-blue-50 text-[#003A78] text-[9px] font-bold rounded border border-blue-100">RBAC Secure</span>
            </div>
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-[11px]">
                  Only administrators and managers have access to system audit logs.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="text-xs flex items-start gap-2 border-b border-slate-50 pb-2 last:border-b-0">
                    <span className="shrink-0 text-[10px] text-slate-400 font-mono mt-0.5 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-bold leading-tight">
                        {log.userName} <span className="text-[#2B86C5] font-semibold font-mono text-[9px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">{log.action}</span>
                      </p>
                      <p className="text-slate-500 mt-0.5 leading-tight truncate text-[11px]">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2.5 mt-2">
            Audit logging captures all database modifications.
          </div>
        </div>
      </div>
    </div>
  );
};
