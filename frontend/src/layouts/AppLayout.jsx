import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, ShieldCheck, Bell, AlertTriangle, Map, Crosshair, Users, Activity, Eye, ShieldAlert, Cpu, Key } from 'lucide-react';

const ADMIN_NAV = [
    { path: '/profile',     label: 'My Profile',        icon: User },
    { path: '/admin',       label: 'System Dashboard',  icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management',   icon: Users },
    { path: '/admin/access', label: 'Access Management', icon: Key }
];

const DEPT_NAV = [
    { path: '/profile',                 label: 'My Profile',      icon: User },
    { path: '/dashboard',               label: 'Command Center',  icon: LayoutDashboard },
    { path: '/dashboard/verification',  label: 'Verify Reports',  icon: ShieldCheck },
    { path: '/alerts',                  label: 'Live Alerts',     icon: Bell },
    { path: '/incidents',               label: 'Incidents',       icon: AlertTriangle },
    { path: '/hotspots',                label: 'Risk Hotspots',   icon: Map },
    { path: '/forest-command',          label: 'Forest Command',  icon: Crosshair },
    { path: '/ai-assistant',            label: 'AI Assistant',    icon: Cpu }
];

const PUBLIC_NAV = [
    { path: '/profile',         label: 'My Profile',        icon: User },
    { path: '/public',          label: 'My Dashboard',      icon: LayoutDashboard },
    { path: '/report-sighting', label: 'Report Sighting',   icon: Eye },
    { path: '/livestock-loss',  label: 'Livestock Loss',    icon: AlertTriangle },
    { path: '/tourist',         label: 'Tourist Safety',    icon: ShieldAlert }
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navToUse = user?.role === 'ADMIN' ? ADMIN_NAV : user?.role === 'DEPARTMENT' ? DEPT_NAV : PUBLIC_NAV;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-16 flex items-center px-6 bg-gray-900 border-b border-gray-800">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
            GirGuard AI
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navToUse.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                )}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
          <span className="text-lg font-bold text-white">GirGuard</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

