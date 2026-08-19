import { useEffect, useState } from 'react';
import { getTouristZones } from '../services/api/index.js';
import { mockWeather, mockSafetyGuidelines, mockOfficialWarnings } from '../data/index.js';
import { StatusBadge } from '../components/Badges.jsx';
import { DemoDataBanner } from '../components/UI.jsx';
import { formatTime } from '../utils/riskUtils.js';

function ScoreRing({ score, size = 80 }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : score >= 40 ? '#fb923c' : '#f87171';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#374151" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{score}</text>
    </svg>
  );
}

export default function TouristSafetyPage() {
  const [zones, setZones] = useState([]);
  const [helpClicked, setHelpClicked] = useState(false);

  useEffect(() => { getTouristZones().then(r => setZones(r.data)); }, []);

  const overallScore = zones.length ? Math.round(zones.reduce((a, z) => a + z.safetyScore, 0) / zones.length) : 75;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DemoDataBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tourist Safety</h1>
          <p className="text-sm text-gray-400 mt-1">Gir Forest National Park & Girnar Region — Visitor Safety Dashboard</p>
        </div>
        <button
          onClick={() => setHelpClicked(true)}
          className="bg-red-700 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg transition-colors flex items-center gap-2"
        >
          🆘 I NEED HELP
        </button>
      </div>

      {helpClicked && (
        <div className="bg-red-950/70 border border-red-600 rounded-xl p-5 space-y-3">
          <h3 className="text-red-300 font-bold text-lg">🆘 Emergency Assistance</h3>
          <p className="text-sm text-red-200">Stay calm. Do not run. Back away slowly from any wildlife.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-red-900/40 rounded-lg p-3">
              <div className="text-xs text-red-400 font-medium">Forest Department Emergency</div>
              <div className="text-xl font-bold text-white">1926</div>
            </div>
            <div className="bg-red-900/40 rounded-lg p-3">
              <div className="text-xs text-red-400 font-medium">Police Control Room</div>
              <div className="text-xl font-bold text-white">100</div>
            </div>
          </div>
          <p className="text-xs text-red-400">⚠ DEMO: Emergency backend not yet connected. In a real emergency call 1926 or 100 directly.</p>
          <button onClick={() => setHelpClicked(false)} className="text-xs text-red-400 hover:text-red-300 underline">Dismiss</button>
        </div>
      )}

      {/* Overall Safety + Weather */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col items-center gap-2 col-span-1">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Overall Safety Score</div>
          <ScoreRing score={overallScore} size={90} />
          <div className="text-xs text-gray-500">Regional average</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 col-span-2">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Current Conditions</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Temperature:</span> <span className="text-white">{mockWeather.temperature}°C</span></div>
            <div><span className="text-gray-500">Condition:</span> <span className="text-white">{mockWeather.condition}</span></div>
            <div><span className="text-gray-500">Humidity:</span> <span className="text-white">{mockWeather.humidity}%</span></div>
            <div><span className="text-gray-500">Wind:</span> <span className="text-white">{mockWeather.windSpeed} km/h</span></div>
            <div><span className="text-gray-500">Sunrise:</span> <span className="text-white">{mockWeather.sunrise}</span></div>
            <div><span className="text-gray-500">Sunset:</span> <span className="text-white">{mockWeather.sunset}</span></div>
          </div>
          <div className="mt-3 bg-blue-950/40 border border-blue-800/40 rounded-lg p-2 text-xs text-blue-300">
            💡 {mockWeather.advisory}
          </div>
        </div>
      </div>

      {/* Official Warnings */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-3">Official Warnings</div>
        <div className="space-y-2">
          {mockOfficialWarnings.map(w => (
            <div key={w.id} className={`rounded-lg p-3 border text-sm flex items-start gap-3 ${w.level === 'HIGH' ? 'bg-red-950/40 border-red-700' : w.level === 'CAUTION' ? 'bg-yellow-950/40 border-yellow-700' : 'bg-blue-950/40 border-blue-800'}`}>
              <span>{w.level === 'HIGH' ? '🔴' : w.level === 'CAUTION' ? '🟡' : 'ℹ️'}</span>
              <div>
                <span className={`font-semibold ${w.level === 'HIGH' ? 'text-red-300' : w.level === 'CAUTION' ? 'text-yellow-300' : 'text-blue-300'}`}>{w.level}: </span>
                <span className="text-gray-300">{w.message}</span>
                <div className="text-xs text-gray-500 mt-1">{formatTime(w.issued)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-3">Permitted Zones & Safety Status</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-700">
                <th className="text-left py-2 pr-3">Zone</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2 pr-3">Safety</th>
                <th className="text-left py-2 pr-3 hidden sm:table-cell">Activity</th>
                <th className="text-left py-2 hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id} className="border-b border-gray-700/40 hover:bg-gray-700/30">
                  <td className="py-2.5 pr-3 text-gray-200 font-medium">{z.name}</td>
                  <td className="py-2.5 pr-3"><StatusBadge status={z.status} /></td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${z.safetyScore >= 80 ? 'bg-green-400' : z.safetyScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${z.safetyScore}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{z.safetyScore}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-400 text-xs hidden sm:table-cell">{z.activity}</td>
                  <td className="py-2.5 text-gray-500 text-xs hidden md:table-cell max-w-xs truncate">{z.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-3">🛡️ Safety Guidelines for Visitors</div>
        <ol className="space-y-2">
          {mockSafetyGuidelines.map((g, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="bg-green-900/40 text-green-400 border border-green-800/40 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
              {g}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
