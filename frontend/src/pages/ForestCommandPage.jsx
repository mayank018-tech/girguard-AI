import { useEffect, useState, useRef } from 'react';
import { getIncidents, getRiskPredictions, getResponseTeams, getVillages, getSightings, getHotspots } from '../services/api/index.js';
import { sendMessageToGranite } from '../services/api/index.js';
import { mockRiskForecast } from '../data/index.js';
import { RiskBadge, StatusBadge } from '../components/Badges.jsx';
import { DemoDataBanner, GraniteComingSoon, SectionHeader, LoadingSpinner } from '../components/UI.jsx';
import { formatTime, timeAgo } from '../utils/riskUtils.js';
import GirMap from '../components/GirMap.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const EXAMPLE_PROMPTS = [
  'Why is Jamwala high risk?',
  'Show active incidents.',
  'Which villages have increasing risk?',
  'Summarize today\'s incidents.',
  'Generate today\'s conflict report.',
  'What is the 6-hour risk forecast?',
];

export default function ForestCommandPage() {
    const [incidents, setIncidents] = useState(null);
  const [risks, setRisks] = useState(null);
  const [teams, setTeams] = useState(null);
  const [villages, setVillages] = useState(null);
  const [sightings, setSightings] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'GirGuard AI Copilot ready. Ask about incidents, risk predictions, village status, or request a conflict report. Note: IBM Granite integration coming in next phase ... currently using mock responses.' }
  ]);
  const [input, setInput]    = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef            = useRef(null);

  useEffect(() => {
    Promise.all([getIncidents(), getRiskPredictions(), getResponseTeams(), getVillages(), getSightings(), getHotspots()])
      .then(([inc, risk, teams, vil, sigh, hot]) => setData({ incidents: inc.data, risks: risk.data, teams: teams.data, villages: vil.data, sightings: sigh.data, hotspots: hot.data }));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMsg(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setThinking(true);
    try {
      const res = await sendMessageToGranite(msg, {});
      setMessages(m => [...m, { role: 'assistant', text: res.reply, source: res.source }]);
    } finally {
      setThinking(false);
    }
  }

  if (!data) return <LoadingSpinner text="Loading Forest Command..." />;

  const activeInc  = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalR = risks ? risks.filter(r => r.riskLevel === 'CRITICAL').length : '...';
  const deployedT = teams ? teams.filter(t => t.status === 'DEPLOYED' || t.status === 'PATROLLING').length : '...';

  return (
    <div className="space-y-5">
      <DemoDataBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Forest Command Center</h1>
          <p className="text-sm text-gray-400 mt-1">Advanced operational dashboard for forest department officials</p>
        </div>
        <GraniteComingSoon />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-800 border border-red-800/50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{activeInc ? activeInc.length : '...'}</div>
          <div className="text-xs text-gray-400">Active Incidents</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{criticalR}</div>
          <div className="text-xs text-gray-400">Critical Risks</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{deployedT}</div>
          <div className="text-xs text-gray-400">Teams Active</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">28m</div>
          <div className="text-xs text-gray-400">Avg Response Time</div>
        </div>
      </div>

      {/* Map + AI side by side on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Map */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <SectionHeader title="GIS Situational Map" subtitle="Real-time positions ... demo coordinates" />
          {!villages || !sightings || !hotspots || !teams ? <div className="h-[400px] flex items-center justify-center"><LoadingSpinner /></div> : <GirMap villages={villages} sightings={sightings} hotspots={hotspots} teams={teams} height={320} />
        </div>

        {/* AI Copilot */}
        <div className="bg-gray-800 border border-indigo-800/40 rounded-xl flex flex-col" style={{ minHeight: '400px' }}>
          <div className="px-4 pt-4 pb-3 border-b border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-indigo-300">... IBM Granite AI Copilot</div>
              <div className="text-xs text-indigo-500">Mock responses ?? IBM Granite integration: next phase</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" title="Mock mode" />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: '260px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-sm rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-green-800/50 text-green-100' : 'bg-gray-700 text-gray-200'}`}>
                  {m.text}
                  {m.source === 'mock' && <div className="text-xs text-gray-500 mt-1">Mock response</div>}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-xl px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
                  <span className="animate-pulse">...</span> Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {/* Example prompts */}
          <div className="px-4 py-2 border-t border-gray-700/50 flex flex-wrap gap-1">
            {EXAMPLE_PROMPTS.slice(0,3).map(p => (
              <button key={p} onClick={() => sendMsg(p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-2 py-1 transition-colors">{p}</button>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); sendMsg(); }} className="px-4 pb-4 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about incidents, risk, villages..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-600"
              disabled={thinking}
            />
            <button type="submit" disabled={thinking || !input.trim()} className="bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Incidents table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <SectionHeader title="Active Incidents" subtitle="Open and responding incidents" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-700">
                <th className="text-left py-2 pr-3">ID</th>
                <th className="text-left py-2 pr-3">Village</th>
                <th className="text-left py-2 pr-3">Species</th>
                <th className="text-left py-2 pr-3">Severity</th>
                <th className="text-left py-2 pr-3 hidden lg:table-cell">Detected</th>
                <th className="text-left py-2 pr-3 hidden md:table-cell">Team</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} className="border-b border-gray-700/40 hover:bg-gray-700/30">
                  <td className="py-2 pr-3 font-mono text-xs text-gray-500">{inc.id}</td>
                  <td className="py-2 pr-3 text-gray-200">{inc.village}</td>
                  <td className="py-2 pr-3 text-gray-400">{inc.species}</td>
                  <td className="py-2 pr-3"><RiskBadge level={inc.severity} size="xs" /></td>
                  <td className="py-2 pr-3 text-gray-500 text-xs hidden lg:table-cell">{timeAgo(inc.detected)}</td>
                  <td className="py-2 pr-3 text-gray-400 text-xs hidden md:table-cell max-w-xs truncate">{inc.assignedTeam}</td>
                  <td className="py-2"><StatusBadge status={inc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Forecast */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <SectionHeader title="6-Hour Risk Forecast" subtitle="Predicted regional risk level ... mock model" />
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockRiskForecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }} />
              <Line type="monotone" dataKey="risk" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} name="Risk Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-2">ML risk prediction engine active (rf-v1) ?? Synthetic training data ?? Validate with field data before operational deployment</div>
      </div>
    </div>
  );
}


