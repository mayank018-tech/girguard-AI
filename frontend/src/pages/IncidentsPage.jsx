import { useEffect, useState } from 'react';
import { getIncidents, getResponseTeams } from '../services/api/index.js';
import { RiskBadge, StatusBadge } from '../components/Badges.jsx';
import { DemoDataBanner, SectionHeader, LoadingSpinner } from '../components/UI.jsx';
import { formatTime, timeAgo } from '../utils/riskUtils.js';

const SEVERITIES = ['All Severity', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
const STATUSES   = ['All Status', 'ACTIVE', 'RESPONDING', 'MONITORING', 'RESOLVED'];
const SPECIES    = ['All Species', 'Asiatic Lion', 'Leopard', 'Hyena'];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ severity: 'All Severity', status: 'All Status', species: 'All Species' });
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    Promise.all([getIncidents(), getResponseTeams()]).then(([inc, t]) => {
      setIncidents(inc.data); setTeams(t.data); setLoading(false);
    });
  }, []);

  const filtered = incidents.filter(i => {
    if (filters.severity !== 'All Severity' && i.severity !== filters.severity) return false;
    if (filters.status !== 'All Status' && i.status !== filters.status) return false;
    if (filters.species !== 'All Species' && i.species !== filters.species) return false;
    return true;
  });

  const counts = {
    total: incidents.length,
    active: incidents.filter(i => i.status === 'ACTIVE').length,
    responding: incidents.filter(i => i.status === 'RESPONDING').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-5">
      <DemoDataBanner />
      <div>
        <h1 className="text-2xl font-bold text-white">Incident Management</h1>
        <p className="text-sm text-gray-400 mt-1">Track, assign, and resolve wildlife conflict incidents</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Total', v: counts.total, c: 'text-white' },
          { l: 'Active', v: counts.active, c: 'text-red-400' },
          { l: 'Responding', v: counts.responding, c: 'text-orange-400' },
          { l: 'Resolved', v: counts.resolved, c: 'text-green-400' },
        ].map(s => (
          <div key={s.l} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([['severity', SEVERITIES], ['status', STATUSES], ['species', SPECIES]]).map(([key, opts]) => (
          <select key={key} value={filters[key]} onChange={e => setFilters(f => ({...f, [key]: e.target.value}))}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600">
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {loading ? <LoadingSpinner text="Loading incidents..." /> : (
        <div className="space-y-3">
          {filtered.map(inc => (
            <div key={inc.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-750"
                onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RiskBadge level={inc.severity} size="xs" />
                    <StatusBadge status={inc.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{inc.village}</span>
                      <span className="text-gray-500">??</span>
                      <span className="text-sm text-gray-300">{inc.species}</span>
                      <span className="text-xs text-gray-500">?? {inc.type}</span>
                      <span className="font-mono text-xs text-gray-600">{inc.id}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {timeAgo(inc.detected)} ?? Team: {inc.assignedTeam}
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">{expanded === inc.id ? '...' : '...'}</span>
                </div>
              </div>
              {expanded === inc.id && (
                <div className="px-4 pb-4 border-t border-gray-700/50 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Description: </span><span className="text-gray-300">{inc.description}</span></div>
                    <div><span className="text-gray-500">Detected: </span><span className="text-gray-300">{formatTime(inc.detected)}</span></div>
                    <div><span className="text-gray-500">Assigned Team: </span><span className="text-gray-300">{inc.assignedTeam}</span></div>
                    <div><span className="text-gray-500">Type: </span><span className="text-gray-300">{inc.type}</span></div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No incidents match the selected filters.</div>
          )}
        </div>
      )}

      {/* Response Teams */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <SectionHeader title="Response Teams" subtitle="Current deployment status" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-700">
                <th className="text-left py-2 pr-3">Team</th>
                <th className="text-left py-2 pr-3">Type</th>
                <th className="text-left py-2 pr-3">Members</th>
                <th className="text-left py-2 pr-3">Location</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id} className="border-b border-gray-700/40 hover:bg-gray-700/30">
                  <td className="py-2 pr-3 text-gray-200 font-medium text-xs">{t.name}</td>
                  <td className="py-2 pr-3 text-gray-400 text-xs">{t.type}</td>
                  <td className="py-2 pr-3 text-gray-400 text-xs">{t.members}</td>
                  <td className="py-2 pr-3 text-gray-500 text-xs">{t.location}</td>
                  <td className="py-2"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
