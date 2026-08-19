import { useState } from 'react';
import { submitSighting } from '../services/api/index.js';
import { DemoDataBanner } from '../components/UI.jsx';

const SPECIES_OPTS = ['Asiatic Lion', 'Leopard', 'Striped Hyena', 'Indian Wolf', 'Chinkara', 'Nilgai', 'Other'];
const SOURCE_OPTS  = ['Citizen', 'Forest Official', 'Camera Trap', 'Other'];
const VILLAGE_OPTS = ['Sasan Gir', 'Maliya', 'Jamwala', 'Visavadar', 'Talala', 'Kodinar', 'Mendarda', 'Khambha', 'Una', 'Dhari', 'Other'];

const INITIAL = { species: '', date: '', time: '', village: '', location: '', description: '', source: 'Citizen', image: null };

export default function ReportSightingPage() {
  const [form, setForm]     = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.species)     e.species = 'Species is required.';
    if (!form.date)        e.date    = 'Date is required.';
    if (!form.time)        e.time    = 'Time is required.';
    if (!form.village)     e.village = 'Village is required.';
    if (!form.description) e.description = 'Please provide a brief description.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await submitSighting(form);
      setResult(res);
      setForm(INITIAL);
    } finally {
      setSubmitting(false);
    }
  }

  function Field({ label, error, children }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        {children}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }

  const inputCls = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-700';

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-gray-800 border border-green-700 rounded-xl p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-green-300">Sighting Submitted</h2>
          <div className="bg-gray-900 rounded-lg p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="text-yellow-300 font-semibold">Pending Verification</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Sighting ID</span>
              <span className="text-white font-mono font-bold">{result.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Mode</span>
              <span className="text-amber-400 text-xs">Mock Submission</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">Your sighting has been logged. A forest official will verify and respond within 24 hours.</p>
          <button
            onClick={() => setResult(null)}
            className="bg-green-800 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Submit Another Sighting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <DemoDataBanner />
      <div>
        <h1 className="text-2xl font-bold text-white">Report Wildlife Sighting</h1>
        <p className="text-sm text-gray-400 mt-1">Submit a sighting report to alert forest officials and trigger risk assessment.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Species *" error={errors.species}>
            <select value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))} className={inputCls}>
              <option value="">Select species…</option>
              {SPECIES_OPTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Source *">
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className={inputCls}>
              {SOURCE_OPTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Date *" error={errors.date}>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
          </Field>

          <Field label="Time *" error={errors.time}>
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={inputCls} />
          </Field>

          <Field label="Nearest Village *" error={errors.village}>
            <select value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} className={inputCls}>
              <option value="">Select village…</option>
              {VILLAGE_OPTS.map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>

          <Field label="Approximate Location">
            <input type="text" placeholder="e.g. Near water tank, north of forest road…" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputCls} />
          </Field>
        </div>

        <Field label="Description *" error={errors.description}>
          <textarea
            rows={4}
            placeholder="Describe what you observed: number of animals, behaviour, direction of movement…"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label="Photo Evidence (Optional)">
          <div className="bg-gray-900 border border-dashed border-gray-600 rounded-lg px-4 py-6 text-center">
            <div className="text-gray-500 text-sm">📷 Image upload available in Phase 2 (IBM Cloud Storage)</div>
            <div className="text-xs text-gray-600 mt-1">Future: Upload to IBM Cloud Object Storage</div>
          </div>
        </Field>

        <div className="bg-amber-950/40 border border-amber-700/40 rounded-lg px-3 py-2 text-xs text-amber-400">
          ⚠ This is a DEMO form. Submission is simulated. No real data is transmitted.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {submitting ? 'Submitting…' : 'Submit Sighting Report'}
        </button>
      </form>
    </div>
  );
}
