import { Link } from 'react-router-dom';

const features = [
  { icon: '????', title: 'Live Alerts', desc: 'Real-time wildlife proximity alerts for villages across Gir.', path: '/alerts' },
  { icon: '????', title: 'Report Sighting', desc: 'Citizens and officials submit wildlife sightings instantly.', path: '/report-sighting' },
  { icon: '???????', title: 'Forest Command', desc: 'Advanced command center with GIS maps and AI copilot.', path: '/forest-command' },
  { icon: '????', title: 'Hotspot Analytics', desc: 'Conflict pattern analysis and predictive risk mapping.', path: '/hotspots' },
  { icon: '????', title: 'Livestock Loss', desc: 'File livestock predation claims with digital evidence.', path: '/livestock-loss' },
  { icon: '???????', title: 'Tourist Safety', desc: 'Zone-based safety scores for Gir and Girnar visitors.', path: '/tourist' },
  { icon: '???', title: 'Incident Management', desc: 'Track, assign, and resolve conflict incidents end-to-end.', path: '/incidents' },
  { icon: '????', title: 'AI Assistant', desc: 'IBM Granite-powered copilot for forest officials. (Next phase)', path: '/ai-assistant' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-green-950 to-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-700/50 rounded-full px-4 py-1.5 text-xs text-amber-300 mb-6">
            ??? DEMO MODE ??? Synthetic Data Only
          </div>
          <div className="text-6xl mb-4">????</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            GirGuard <span className="text-green-400">AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">Agentic Wildlife Conflict & Eco-Safety Command Center</p>
          <p className="text-sm text-gray-500 mb-8">Gir Forest National Park ?? Gujarat, India</p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-lg px-4 py-2 text-sm text-indigo-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              IBM Granite Integration ??? Coming Next Phase
            </div>
            <div className="bg-blue-950/60 border border-blue-700/50 rounded-lg px-4 py-2 text-sm text-blue-300">
              ??? IBM Cloud Architecture Ready
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
            >
              Open Dashboard ???
            </Link>
            <Link
              to="/forest-command"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-8 py-3 rounded-lg transition-colors text-sm border border-gray-700"
            >
              Forest Command Center
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { v: '10', l: 'Villages Monitored' },
            { v: '2', l: 'Critical Alerts' },
            { v: '62', l: 'Wildlife Species Tracked' },
            { v: '9', l: 'Response Teams' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-bold text-green-400">{s.v}</div>
              <div className="text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Platform Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <Link
              key={f.path}
              to={f.path}
              className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-green-700/50 rounded-xl p-5 transition-all group"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold text-white text-sm group-hover:text-green-300 transition-colors mb-1">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">IBM Cloud Architecture (Phase 2+)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-1">??????</div>
              <div className="font-medium text-gray-300">React Frontend</div>
              <div>Vite + Tailwind CSS</div>
              <div className="text-green-400 mt-1">??? Phase 1 ??? Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">????</div>
              <div className="font-medium text-gray-300">Flask Backend</div>
              <div>REST API + ML Pipeline</div>
              <div className="text-yellow-400 mt-1">??? Phase 2 ??? Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">??????</div>
              <div className="font-medium text-gray-300">IBM Cloud + Granite</div>
              <div>AI ?? DB ?? ML ?? Deploy</div>
              <div className="text-yellow-400 mt-1">??? Phase 2 ??? Planned</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-700 border-t border-gray-800 py-6">
        GirGuard AI ?? Hackathon Demo ?? Built with IBM Bob ?? Gir Forest, Gujarat
      </footer>
    </div>
  );
}
