import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { path: '/dashboard',       label: 'Overview',        icon: '🗺️' },
  { path: '/alerts',          label: 'Live Alerts',     icon: '🚨' },
  { path: '/report-sighting', label: 'Report Sighting', icon: '🦁' },
  { path: '/livestock-loss',  label: 'Livestock Loss',  icon: '🐄' },
  { path: '/tourist',         label: 'Tourist Safety',  icon: '🏕️' },
  { path: '/forest-command',  label: 'Forest Command',  icon: '🛡️' },
  { path: '/incidents',       label: 'Incidents',       icon: '⚡' },
  { path: '/hotspots',        label: 'Hotspots',        icon: '📊' },
  { path: '/ai-assistant',    label: 'AI Assistant',    icon: '🤖' },
];

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) return <>{children}</>;

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
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🦁</div>
            <div>
              <div className="font-bold text-white text-base leading-tight">GirGuard AI</div>
              <div className="text-xs text-gray-500 leading-tight">Wildlife Command Center</div>
            </div>
          </div>
          <div className="mt-3 bg-indigo-950/50 border border-indigo-800/50 rounded-md px-2 py-1.5">
            <div className="text-xs text-indigo-300 font-medium leading-tight">Powered by IBM Granite + IBM Cloud</div>
            <div className="text-xs text-indigo-500 mt-0.5">Integration — Next Phase</div>
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
                  ? 'bg-green-900/50 text-green-300 font-medium border border-green-800/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="text-xs text-gray-600">Gir Forest, Gujarat, India</div>
          <div className="text-xs text-amber-600/70 mt-1">⚠ Demo Mode — Mock Data</div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-800 text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              System Online
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-amber-400/80 bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded">
              ⚠ DEMO MODE — Synthetic Data
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-red-400 font-semibold bg-red-950/50 border border-red-800/50 px-2 py-1 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              2 CRITICAL
            </div>
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center text-sm font-bold text-green-300 border border-green-700">
              FO
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
