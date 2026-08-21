import { useEffect, useState } from 'react';
import { getAlerts } from '../services/api/index.js';
import { RiskBadge, StatusBadge } from '../components/Badges.jsx';
import { DemoDataBanner, SectionHeader, LoadingSpinner } from '../components/UI.jsx';
import { formatTime, getRiskConfig } from '../utils/riskUtils.js';

const SPECIES = ['All Species', 'Asiatic Lion', 'Leopard', 'Hyena'];
const STATUSES = ['All Status', 'NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];
const RISK_LEVELS_F = ['All Risk', 'CRITICAL', 'HIGH', 'ELEVATED', 'MODERATE', 'LOW'];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ risk: 'All Risk', species: 'All Species', status: 'All Status' });

  useEffect(() => {
    getAlerts().then(r => { setAlerts(r.data); setLoading(false); });
  }, []);

  const filtered = alerts.filter(a => {
    if (filters.risk !== 'All Risk' && a.riskLevel !== filters.risk) return false;
    if (filters.species !== 'All Species' && a.animal !== filters.species) return false;
    if (filters.status !== 'All Status' && a.status !== filters.status) return false;
    return true;
  });

  const counts = {
    CRITICAL: alerts.filter(a => a.riskLevel === 'CRITICAL').length,
    HIGH: alerts.filter(a => a.riskLevel === 'HIGH').length,
    total: alerts.length,
    active: alerts.filter(a => a.status !== 'RESOLVED').length,
  };

  function setFilter(key, val) { setFilters(f => ({ ...f, [key]: val })); }

  return (
    <div className="space-y-5">
      <DemoDataBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wildlife Alerts</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time conflict proximity alerts across Gir villages</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Total Alerts', v: counts.total, c: 'text-white' },
          { l: 'Active', v: counts.active, c: 'text-orange-400' },
          { l: 'Critical', v: counts.CRITICAL, c: 'text-red-400' },
          { l: 'High', v: counts.HIGH, c: 'text-orange-400' },
        ].map(s => (
          <div key={s.l} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([['risk', RISK_LEVELS_F], ['species', SPECIES], ['status', STATUSES]] ).map(([key, opts]) => (
          <select
            key={key}
            value={filters[key]}
            onChange={e => setFilter(key, e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
          >
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <button
          onClick={() => setFilters({ risk: 'All Risk', species: 'All Species', status: 'All Status' })}
          className="text-xs text-gray-500 hover:text-gray-300 px-3 py-2"
        >
          Reset
        </button>
      </div>

      {loading ? <LoadingSpinner text="Loading alerts..." /> : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No alerts match the selected filters.</div>
          )}
          {filtered.map(alert => {
            const cfg = getRiskConfig(alert.riskLevel);
            return (
              <div key={alert.id} className={`bg-gray-800 border ${cfg.border} rounded-xl p-4`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RiskBadge level={alert.riskLevel} score={alert.riskScore} showScore />
                    <StatusBadge status={alert.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-white">{alert.village}</span>
                      <span className="text-gray-400 text-sm">??</span>
                      <span className="text-sm text-gray-300">{alert.animal}</span>
                      <span className="text-xs text-gray-500 font-mono">{alert.id}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{alert.reason}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500">... {formatTime(alert.time)}</span>
                      <span className="text-xs text-gray-500">Confidence: <span className="text-gray-300">{alert.confidence}%</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
