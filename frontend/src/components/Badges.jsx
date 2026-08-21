import { getRiskConfig } from '../utils/riskUtils.js';
import clsx from 'clsx';

export function RiskBadge({ level, score, showScore = false, size = 'sm' }) {
  const cfg = getRiskConfig(level);
  const sizes = { xs: 'text-xs px-1.5 py-0.5', sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1' };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded font-bold border', cfg.bg, cfg.color, cfg.border, sizes[size])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {level}{showScore && score !== undefined && ` ?? ${score}`}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    NEW:          'bg-blue-900/40 text-blue-300 border-blue-700',
    ACKNOWLEDGED: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    IN_PROGRESS:  'bg-orange-900/40 text-orange-300 border-orange-700',
    RESOLVED:     'bg-green-900/40 text-green-300 border-green-700',
    ACTIVE:       'bg-red-900/40 text-red-300 border-red-700',
    RESPONDING:   'bg-orange-900/40 text-orange-300 border-orange-700',
    MONITORING:   'bg-blue-900/40 text-blue-300 border-blue-700',
    SUBMITTED:          'bg-blue-900/40 text-blue-300 border-blue-700',
    UNDER_REVIEW:       'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    VERIFICATION_REQUIRED: 'bg-purple-900/40 text-purple-300 border-purple-700',
    APPROVED:     'bg-green-900/40 text-green-300 border-green-700',
    REJECTED:     'bg-gray-700 text-gray-400 border-gray-600',
    DEPLOYED:     'bg-orange-900/40 text-orange-300 border-orange-700',
    PATROLLING:   'bg-blue-900/40 text-blue-300 border-blue-700',
    STANDBY:      'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    ON_DUTY:      'bg-green-900/40 text-green-300 border-green-700',
    OFF_DUTY:     'bg-gray-700 text-gray-400 border-gray-600',
    OPEN:         'bg-green-900/40 text-green-300 border-green-700',
    CAUTION:      'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    RESTRICTED:   'bg-red-900/40 text-red-300 border-red-700',
    Verified:     'bg-green-900/40 text-green-300 border-green-700',
    Pending:      'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  };
  const cls = map[status] || 'bg-gray-700 text-gray-400 border-gray-600';
  return (
    <span className={clsx('inline-block text-xs font-semibold px-2 py-0.5 rounded border', cls)}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
