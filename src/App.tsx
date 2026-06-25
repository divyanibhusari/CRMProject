import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from './utils/api.js';
import { User, CRMNotification } from './types.js';
import { Sidebar } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { LeadsView } from './components/LeadsView.js';
import { FollowUpsView } from './components/FollowUpsView.js';
import { SiteVisitsView } from './components/SiteVisitsView.js';
import { ProjectsView } from './components/ProjectsView.js';
import { BookingsView } from './components/BookingsView.js';
import { PaymentsView } from './components/PaymentsView.js';
import { ReportsView } from './components/ReportsView.js';
import { UsersView } from './components/UsersView.js';
import { SettingsView } from './components/SettingsView.js';
import { Toast, ToastContainer } from './components/NotificationToast.js';
import { Lock, User as UserIcon, LogIn } from 'lucide-react';

function CRMApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Trigger custom toast notification
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.floor(Math.random() * 100);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check login state
  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const userProfile = await apiRequest<User>('/auth/me');
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      loadNotifications();
    } catch (err) {
      setIsAuthenticated(false);
      removeAuthToken();
    } finally {
      setLoading(false);
    }
  };

  // Fetch in-app notifications
  const loadNotifications = async () => {
    try {
      const alerts = await apiRequest<CRMNotification[]>('/notifications');
      setNotifications(alerts);
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for authentication expiries from api helper
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      triggerToast('Session expired, please sign in again', 'warning');
      navigate('/login');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  // Periodic notification reload
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadNotifications();
      }, 15000); // Poll notifications every 15 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle manual login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setLoginError(null);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/login', 'POST', {
        username,
        password
      });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      triggerToast(`Welcome back, ${res.user.name}!`, 'success');
      loadNotifications();
      navigate('/app/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-configured 1-click accounts helper
  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword('password123');
    setLoginError(null);
    
    // Wait tiny moment then trigger submit
    setTimeout(async () => {
      setSubmitting(true);
      try {
        const res = await apiRequest<{ token: string; user: User }>('/auth/login', 'POST', {
          username: uname,
          password: 'password123'
        });
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        triggerToast(`Signed in as ${res.user.name} (${res.user.role})`, 'success');
        loadNotifications();
        navigate('/app/dashboard');
      } catch (err: any) {
        setLoginError(err.message || 'Quick login failed');
      } finally {
        setSubmitting(false);
      }
    }, 100);
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    triggerToast('Signed out of VIP Project CRM', 'info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#003A78]"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Initializing VIP CRM Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Routes>
        {/* Unauthenticated Login Screen */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 selection:bg-[#003A78] selection:text-white">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  {/* Header */}
                  <div className="p-6 bg-[#003A78] text-white flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#003A78] font-black text-xl shadow-md border-2 border-blue-100">
                      VIP
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-wider uppercase">VIP PROJECT</h2>
                      <p className="text-xs text-blue-200 uppercase font-semibold">Enterprise Real Estate CRM</p>
                    </div>
                  </div>

                  {/* Form container */}
                  <form onSubmit={handleLogin} className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider text-center">Representative Credentials Login</h3>
                    
                    {loginError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                          placeholder="e.g. superadmin"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A78]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-[#003A78] hover:bg-blue-900 text-white font-semibold rounded-lg text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <LogIn className="w-4 h-4" />
                      {submitting ? 'Verifying Profile...' : 'Authorize Profile Session'}
                    </button>
                  </form>

                  {/* Quick Login pre-sets */}
                  <div className="p-5 bg-slate-50 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block text-center mb-2.5">
                      Testing Presets (One-Click RBAC Sign In)
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                      <button
                        onClick={() => handleQuickLogin('superadmin')}
                        className="py-1.5 px-2 bg-white hover:bg-[#003A78] hover:text-white border border-slate-200 text-[#003A78] rounded-md transition-all truncate text-center cursor-pointer"
                      >
                        Super Admin
                      </button>
                      <button
                        onClick={() => handleQuickLogin('telecaller')}
                        className="py-1.5 px-2 bg-white hover:bg-[#003A78] hover:text-white border border-slate-200 text-[#003A78] rounded-md transition-all truncate text-center cursor-pointer"
                      >
                        Telecaller
                      </button>
                      <button
                        onClick={() => handleQuickLogin('executive')}
                        className="py-1.5 px-2 bg-white hover:bg-[#003A78] hover:text-white border border-slate-200 text-[#003A78] rounded-md transition-all truncate text-center cursor-pointer"
                      >
                        Sales Exec
                      </button>
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 mt-4 text-center font-medium">
                  Authorized personnel only. Password is `password123` for all test accounts.
                </p>
              </div>
            ) : (
              <Navigate to="/app/dashboard" replace />
            )
          }
        />

        {/* Nested Authorized Application Dashboard */}
        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-[#003A78] selection:text-white">
                <Sidebar
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  notifications={notifications}
                  loadNotifications={loadNotifications}
                />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
                  <Outlet />
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Outlet routes corresponding to selected Sidebar sections */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="leads" element={<LeadsView currentUser={currentUser} triggerToast={triggerToast} />} />
          <Route path="followups" element={<FollowUpsView />} />
          <Route path="sitevisits" element={<SiteVisitsView triggerToast={triggerToast} />} />
          <Route path="projects" element={<ProjectsView currentUser={currentUser} triggerToast={triggerToast} />} />
          <Route path="bookings" element={<BookingsView currentUser={currentUser} triggerToast={triggerToast} />} />
          <Route path="payments" element={<PaymentsView currentUser={currentUser} triggerToast={triggerToast} />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="users" element={<UsersView currentUser={currentUser} triggerToast={triggerToast} />} />
          <Route path="settings" element={<SettingsView triggerToast={triggerToast} />} />
        </Route>

        {/* Global Fallback Redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <CRMApp />
    </Router>
  );
}
