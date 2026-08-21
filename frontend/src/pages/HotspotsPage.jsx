import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { DemoDataBanner, SectionHeader } from '../components/UI.jsx';
import { mockIncidentsByVillage, mockIncidentsBySpecies, mockIncidentsByHour, mockMonthlyTrends, mockResponseTimes } from '../data/index.js';

const COLORS = ['#f97316', '#fbbf24', '#4ade80', '#60a5fa', '#c084fc', '#f472b6'];
const TT_STYLE = { background: '#1f2937', border: '1px solid #374151', color: '#f9fafb', fontSize: 12 };

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-white">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

export default function HotspotsPage() {
  return (
    <div className="space-y-5">
      <DemoDataBanner />
      <div>
        <h1 className="text-2xl font-bold text-white">Conflict Hotspot Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Pattern analysis across Gir Forest villages ??? synthetic demo data</p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Incidents by Village" subtitle="Total conflict incidents per village (season)">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockIncidentsByVillage} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="village" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="count" name="Incidents" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Incidents by Species" subtitle="Distribution across animal species">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockIncidentsBySpecies} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {mockIncidentsBySpecies.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Incidents by Time of Day (2h blocks)" subtitle="When do conflicts occur?">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockIncidentsByHour} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="count" name="Incidents" fill="#fbbf24" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Conflict Trends" subtitle="Incidents and livestock losses per month">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMonthlyTrends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Line type="monotone" dataKey="incidents" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Incidents" />
                <Line type="monotone" dataKey="livestock" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} name="Livestock Losses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Response Times */}
      <ChartCard title="Average Response Time by Village" subtitle="Forest department response time in minutes">
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockResponseTimes} layout="vertical" margin={{ top: 5, right: 40, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} unit="m" />
              <YAxis type="category" dataKey="village" tick={{ fill: '#9ca3af', fontSize: 11 }} width={70} />
              <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v} min`, 'Avg Response']} />
              <Bar dataKey="avgMinutes" name="Avg Response (min)" fill="#60a5fa" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="text-xs text-gray-600 text-center pb-2">
        ??? All analytics data is synthetic demo data for development purposes only. Not based on real wildlife statistics.
      </div>
    </div>
  );
}
