import clsx from 'clsx';

export function Card({ className, children, ...props }) {
  return (
    <div className={clsx('bg-gray-800 border border-gray-700 rounded-xl p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function DemoDataBanner() {
  return (
    <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-700/50 rounded-lg px-3 py-2 text-xs text-amber-300 mb-4">
      <span className="font-bold">??? DEMO DATA</span>
      <span className="text-amber-400/80">All data shown is synthetic and for demonstration only. Not real wildlife sightings.</span>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading???' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      <p className="text-gray-300 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}

export function GraniteComingSoon() {
  return (
    <div className="bg-indigo-950/40 border border-indigo-700/50 rounded-lg px-3 py-2 text-xs text-indigo-300 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
      <span><strong>IBM Granite Integration</strong> ??? Coming in next phase</span>
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = 'text-white', alert }) {
  return (
    <div className={clsx('bg-gray-800 border rounded-xl p-4 flex flex-col gap-1', alert ? 'border-red-700' : 'border-gray-700')}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <span className={clsx('text-3xl font-bold', color)}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}
