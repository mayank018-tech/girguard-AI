import os

filepath = 'frontend/src/layouts/AppLayout.jsx'
content = '''import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard',       label: 'Overview',        icon: '📊' },
  { path: '/alerts',          label: 'Live Alerts',     icon: '🚨' },
  { path: '/report-sighting', label: 'Report Sighting', icon: '🐾' },
  { path: '/livestock-loss',  label: 'Livestock Loss',  icon: '🐄' },
  { path: '/tourist',         label: 'Tourist Safety',  icon: '🏕️' },
  { path: '/forest-command',  label: 'Forest Command',  icon: '🛡️' },
  { path: '/incidents',       label: 'Incidents',       icon: '⚠️' },
  { path: '/hotspots',        label: 'Hotspots',        icon: '🔥' },
  { path: '/ai-assistant',    label: 'AI Assistant',    icon: '🤖' },
];

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLanding = location.pathname === '/';

  if (isLanding) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-earth-950 text-earth-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-earth-900 border-r border-earth-800 flex flex-col transform transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-earth-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-forest-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🦁</div>
            <div>
              <div className="font-bold text-white text-base leading-tight">GirGuard AI</div>
              <div className="text-xs text-earth-400 leading-tight">Wildlife Command Center</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-forest-900/50 text-forest-300 font-medium border border-forest-800/50'
                  : 'text-earth-400 hover:bg-earth-800 hover:text-earth-200'
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-earth-800 flex items-center justify-between">
          <div className="text-xs text-earth-500">
            <div>{user?.name || 'Forest Ranger'}</div>
            <div className="text-forest-400 font-bold">{user?.role || 'DEPARTMENT'}</div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded-md transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-earth-900 border-b border-earth-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-earth-800 text-earth-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-earth-400">
              <span className="w-2 h-2 bg-forest-400 rounded-full animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-earth-950 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
'''
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
