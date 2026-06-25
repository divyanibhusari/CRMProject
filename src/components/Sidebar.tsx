import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  MapPin,
  Home,
  CheckSquare,
  CreditCard,
  FileBarChart2,
  Settings,
  LogOut,
  Bell,
  Menu,
  ShieldCheck,
  Building
} from 'lucide-react';
import { CRMNotification, User } from '../types.js';
import { apiRequest } from '../utils/api.js';

interface SidebarProps {
  currentUser: User | null;
  onLogout: () => void;
  notifications: CRMNotification[];
  loadNotifications: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onLogout,
  notifications,
  loadNotifications
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const currentView = location.pathname.split('/').pop() || 'dashboard';

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', 'POST');
      loadNotifications();
      setShowNotifDropdown(false);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Sales Manager', 'Telecaller', 'Sales Executive'] },
    { id: 'leads', label: 'Leads', icon: Users, roles: ['Super Admin', 'Admin', 'Sales Manager', 'Telecaller', 'Sales Executive'] },
    { id: 'followups', label: 'Follow-Ups', icon: PhoneCall, roles: ['Super Admin', 'Admin', 'Sales Manager', 'Telecaller', 'Sales Executive'] },
    { id: 'sitevisits', label: 'Site Visits', icon: MapPin, roles: ['Super Admin', 'Admin', 'Sales Manager', 'Telecaller', 'Sales Executive'] },
    { id: 'projects', label: 'Projects', icon: Home, roles: ['Super Admin', 'Admin', 'Sales Manager', 'Telecaller', 'Sales Executive'] },
    { id: 'bookings', label: 'Bookings', icon: CheckSquare, roles: ['Super Admin', 'Admin', 'Sales Manager', 'Sales Executive'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['Super Admin', 'Admin', 'Sales Manager'] },
    { id: 'reports', label: 'Reports', icon: FileBarChart2, roles: ['Super Admin', 'Admin', 'Sales Manager'] },
    { id: 'users', label: 'Users & Roles', icon: ShieldCheck, roles: ['Super Admin', 'Admin', 'Sales Manager'] },
    { id: 'settings', label: '99acres Sync & Setup', icon: Settings, roles: ['Super Admin', 'Admin'] }
  ];

  const allowedItems = navItems.filter(item => {
    if (!currentUser) return false;
    return item.roles.includes(currentUser.role);
  });

  return (
    <aside className="w-64 bg-[#003A78] text-white min-h-screen flex flex-col justify-between shrink-0 shadow-lg border-r border-[#2B86C5]/20">
      {/* Top Section */}
      <div>
        {/* Branding Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#003A78] font-bold text-lg">
            VIP
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase">VIP PROJECT</h2>
            <p className="text-[9px] text-blue-200 uppercase font-semibold">Enterprise Real Estate CRM</p>
          </div>
        </div>

        {/* User Identity Profile Panel */}
        {currentUser && (
          <div className="p-4 mx-3 my-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2B86C5] flex items-center justify-center text-white font-bold text-sm border-2 border-white/20">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-blue-200 mt-0.5 truncate font-semibold font-mono bg-[#2B86C5] px-1.5 py-0.5 rounded-sm inline-block">
                {currentUser.role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Link Stack */}
        <nav className="px-3 space-y-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/app/${item.id}`);
                  setShowNotifDropdown(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#2B86C5] text-white shadow-sm'
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Identity & Utilities */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-blue-200" />
              <span>In-App Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute left-0 bottom-12 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-2 z-50 animate-scale-up">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Alerts Board</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[#003A78] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">No alerts found</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-blue-50/50 border-l-4 border-[#003A78]' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-slate-500 leading-normal text-[11px]">{n.message}</div>
                      <div className="text-[9px] text-slate-400 text-right mt-1 font-medium font-mono">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Action Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/10 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-300" />
          Sign Out Account
        </button>
      </div>
    </aside>
  );
};
