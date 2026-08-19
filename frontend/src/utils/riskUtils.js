/**
 * Risk scoring utilities
 */

export const RISK_LEVELS = {
  LOW:      { min: 0,  max: 20, label: 'LOW',      color: 'text-green-400',  bg: 'bg-green-900/40',  border: 'border-green-700', dot: 'bg-green-400' },
  MODERATE: { min: 21, max: 40, label: 'MODERATE', color: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-yellow-700', dot: 'bg-yellow-400' },
  ELEVATED: { min: 41, max: 60, label: 'ELEVATED', color: 'text-orange-400', bg: 'bg-orange-900/40', border: 'border-orange-700', dot: 'bg-orange-400' },
  HIGH:     { min: 61, max: 80, label: 'HIGH',      color: 'text-red-400',    bg: 'bg-red-900/40',    border: 'border-red-800',   dot: 'bg-red-400' },
  CRITICAL: { min: 81, max: 100,label: 'CRITICAL', color: 'text-red-300',    bg: 'bg-red-950/60',    border: 'border-red-600',   dot: 'bg-red-300 animate-pulse' },
};

export function getRiskConfig(riskLevel) {
  return RISK_LEVELS[riskLevel] || RISK_LEVELS.LOW;
}

export function scoreToLevel(score) {
  if (score <= 20) return 'LOW';
  if (score <= 40) return 'MODERATE';
  if (score <= 60) return 'ELEVATED';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

export const STATUS_COLORS = {
  NEW:         'bg-blue-900/40 text-blue-300 border-blue-700',
  ACKNOWLEDGED:'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  IN_PROGRESS: 'bg-orange-900/40 text-orange-300 border-orange-700',
  RESOLVED:    'bg-green-900/40 text-green-300 border-green-700',
  ACTIVE:      'bg-red-900/40 text-red-300 border-red-700',
  RESPONDING:  'bg-orange-900/40 text-orange-300 border-orange-700',
  MONITORING:  'bg-blue-900/40 text-blue-300 border-blue-700',
  SUBMITTED:          'bg-blue-900/40 text-blue-300 border-blue-700',
  UNDER_REVIEW:       'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  VERIFICATION_REQUIRED: 'bg-purple-900/40 text-purple-300 border-purple-700',
  APPROVED:    'bg-green-900/40 text-green-300 border-green-700',
  REJECTED:    'bg-gray-800 text-gray-400 border-gray-600',
  DEPLOYED:    'bg-orange-900/40 text-orange-300 border-orange-700',
  PATROLLING:  'bg-blue-900/40 text-blue-300 border-blue-700',
  STANDBY:     'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  ON_DUTY:     'bg-green-900/40 text-green-300 border-green-700',
  OFF_DUTY:    'bg-gray-800 text-gray-400 border-gray-600',
  OPEN:        'bg-green-900/40 text-green-300 border-green-700',
  CAUTION:     'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  RESTRICTED:  'bg-red-900/40 text-red-300 border-red-700',
  Verified:    'bg-green-900/40 text-green-300 border-green-700',
  Pending:     'bg-yellow-900/40 text-yellow-300 border-yellow-700',
};

export function formatTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
}

export function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function generateSightingId() {
  return `SIGHT-${Math.floor(1000 + Math.random() * 9000)}`;
}
