import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '⚠️', title: 'Live Alerts', desc: 'Real-time wildlife proximity alerts for villages across Gir.', path: '/alerts' },
  { icon: '🐾', title: 'Report Sighting', desc: 'Citizens and officials submit wildlife sightings instantly.', path: '/report-sighting' },
  { icon: '🌲', title: 'Forest Command', desc: 'Advanced command center with GIS maps and AI copilot.', path: '/forest-command' },
  { icon: '🔥', title: 'Hotspot Analytics', desc: 'Conflict pattern analysis and predictive risk mapping.', path: '/hotspots' },
  { icon: '🐄', title: 'Livestock Loss', desc: 'File livestock predation claims with digital evidence.', path: '/livestock-loss' },
  { icon: '🎒', title: 'Tourist Safety', desc: 'Zone-based safety scores for Gir and Girnar visitors.', path: '/tourist' },
  { icon: '📝', title: 'Incident Management', desc: 'Track, assign, and resolve conflict incidents end-to-end.', path: '/incidents' },
  { icon: '🤖', title: 'AI Assistant', desc: 'IBM Granite-powered copilot for forest officials. (Next phase)', path: '/ai-assistant' },
];

export default function LandingPage() {
  const { user } = useAuth();
  
  const dashboardLink = user?.role === 'DEPARTMENT' ? '/dashboard' : user?.role === 'ADMIN' ? '/admin' : '/public';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-green-950 to-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-700/50 rounded-full px-4 py-1.5 text-xs text-amber-300 mb-6">
            🔴 DEMO MODE 🔴 Synthetic Data Only
          </div>
          <div className="text-6xl mb-4">🦁</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            GirGuard <span className="text-green-400">AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">Agentic Wildlife Conflict & Eco-Safety Command Center</p>
          <p className="text-sm text-gray-500 mb-8">Gir Forest National Park • Gujarat, India</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
                <Link
                to={dashboardLink}
                className="bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
                >
                Go to Dashboard
                </Link>
            ) : (
                <>
                <Link
                to="/login"
                className="bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
                >
                Login
                </Link>
                <Link
                to="/signup"
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-8 py-3 rounded-lg transition-colors text-sm border border-gray-700"
                >
                Sign Up
                </Link>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Platform Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors block text-left"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-200 text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
