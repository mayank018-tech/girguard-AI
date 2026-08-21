import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAlerts, getRiskPredictions, getIncidents, getSightings, getVillages, getResponseTeams, getHotspots } from '../services/api/index.js';
import { StatCard, DemoDataBanner, SectionHeader, LoadingSpinner } from '../components/UI.jsx';
import { RiskBadge, StatusBadge } from '../components/Badges.jsx';
import GirMap from '../components/GirMap.jsx';
import { formatTime, timeAgo } from '../utils/riskUtils.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([getAlerts(), getRiskPredictions(), getIncidents(), getSightings(), getVillages(), getResponseTeams(), getHotspots()])
      .then(([alerts, risks, incidents, sightings, villages, teams, hotspots]) => {
        setData({ alerts: alerts.data, risks: risks.data, incidents: incidents.data, sightings: sightings.data, villages: villages.data, teams: teams.data, hotspots: hotspots.data });
      });
  }, []);

  if (!data) return <LoadingSpinner text="Loading Dashboard???" />;

  const activeAlerts   = data.alerts.filter(a => a.status !== 'RESOLVED');
  const criticalVillages = data.villages.filter(v => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH');
  const activeIncidents  = data.incidents.filter(i => i.status !== 'RESOLVED');
  const avgResponse = '28 min';

  return (
    <div className="space-y-6">
      <DemoDataBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gir Forest Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Wildlife Conflict Command Dashboard ?? Gir, Gujarat</p>
        </div>
        <div className="text-xs text-gray-500 hidden sm:block">
          Last updated: {new Date().toLocaleTimeString('en-IN')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Active Alerts"    value={activeAlerts.length}      icon="????" color="text-red-400"    alert={activeAlerts.length > 0} sub="Unresolved alerts" />
        <StatCard label="High-Risk Villages" value={criticalVillages.length} icon="???????" color="text-orange-400" sub="HIGH or CRITICAL" />
        <StatCard label="Sightings (24h)"  value={data.sightings.length}    icon="????" color="text-yellow-400" sub="Verified + Pending" />
        <StatCard label="Active Incidents" value={activeIncidents.length}   icon="???" color="text-purple-400" sub="Open incidents" />
        <StatCard label="Avg Response"     value={avgResponse}              icon="??????" color="text-blue-400"   sub="Last 7 days" />
      </div>

      {/* Map */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <SectionHeader title="Live Situational Map" subtitle="Gir Forest Region ??? Demo Coordinates" />
        <GirMap
          villages={data.villages}
          sightings={data.sightings}
          hotspots={data.hotspots}
          teams={data.teams}
          height={380}
        />
      </div>

      {/* Risk + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Predictions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <SectionHeader
            title="Village Risk Scores"
            subtitle={`ML predictions ?? model ${data.risks[0]?.model_version || 'rf-v1'}`}
            action={<Link to="/hotspots" className="text-xs text-green-400 hover:underline">View All ???</Link>}
          />
          <div className="space-y-2">
            {data.risks.slice(0, 6).map(r => (
              <div key={r.id} className="py-2 border-b border-gray-700/50 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <RiskBadge level={r.riskLevel} size="xs" />
                    <span className="text-sm text-gray-200 truncate">{r.village}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {r.riskScore}<span className="text-gray-500 font-normal text-xs">/100</span>
                      </div>
                      {r.confidence != null && (
                        <div className="text-xs text-gray-500">{r.confidence}% conf</div>
                      )}
                    </div>
                    <div className="w-20 bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${r.riskScore >= 81 ? 'bg-red-400' : r.riskScore >= 61 ? 'bg-orange-400' : r.riskScore >= 41 ? 'bg-yellow-400' : 'bg-green-400'}`}
                        style={{ width: `${r.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* Top factors */}
                {r.top_factors && r.top_factors.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.top_factors.slice(0, 2).map((f, i) => (
                      <span key={i} className="text-xs text-gray-500 bg-gray-700/50 rounded px-1.5 py-0.5 truncate max-w-xs">{f}</span>
                    ))}
                  </div>
                )}
                {/* Insufficient data state */}
                {r.riskLevel === 'INSUFFICIENT_DATA' && (
                  <div className="mt-1 text-xs text-gray-500 italic">Insufficient data for reliable prediction</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Prediction window: 6h ?? Last updated: {new Date().toLocaleTimeString('en-IN')}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <SectionHeader
            title="Recent Alerts"
            subtitle="Latest wildlife proximity alerts"
            action={<Link to="/alerts" className="text-xs text-green-400 hover:underline">View All ???</Link>}
          />
          <div className="space-y-2">
            {data.alerts.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-700/50 last:border-0">
                <div className="flex items-start gap-2 min-w-0">
                  <RiskBadge level={a.riskLevel} size="xs" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-200 truncate">{a.village}</div>
                    <div className="text-xs text-gray-500">{a.animal} ?? {timeAgo(a.time)}</div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sightings */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <SectionHeader
          title="Recent Wildlife Sightings"
          subtitle="Last 24 hours ??? verified + pending"
          action={<Link to="/report-sighting" className="text-xs text-green-400 hover:underline">+ Report ???</Link>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-700">
                <th className="text-left py-2 pr-4">ID</th>
                <th className="text-left py-2 pr-4">Species</th>
                <th className="text-left py-2 pr-4 hidden md:table-cell">Village</th>
                <th className="text-left py-2 pr-4">Time</th>
                <th className="text-left py-2 pr-4">Source</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.sightings.map(s => (
                <tr key={s.id} className="border-b border-gray-700/40 hover:bg-gray-700/30">
                  <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{s.id}</td>
                  <td className="py-2 pr-4 text-gray-200">{s.species}</td>
                  <td className="py-2 pr-4 text-gray-400 hidden md:table-cell">{s.village}</td>
                  <td className="py-2 pr-4 text-gray-500 text-xs">{s.date} {s.time}</td>
                  <td className="py-2 pr-4 text-gray-400 text-xs">{s.source}</td>
                  <td className="py-2"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
