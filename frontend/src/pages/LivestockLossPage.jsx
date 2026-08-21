import { useEffect, useState } from 'react';
import { getLivestockLosses, submitLivestockLoss } from '../services/api/index.js';
import { StatusBadge } from '../components/Badges.jsx';
import { DemoDataBanner, SectionHeader } from '../components/UI.jsx';

const LIVESTOCK_TYPES = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Camel', 'Horse', 'Donkey', 'Other'];
const VILLAGE_OPTS    = ['Sasan Gir', 'Maliya', 'Jamwala', 'Visavadar', 'Talala', 'Kodinar', 'Mendarda', 'Khambha', 'Una', 'Dhari', 'Other'];
const SPECIES_OPTS    = ['Asiatic Lion', 'Leopard', 'Striped Hyena', 'Unknown', 'Other'];
const INIT_FORM       = { village: '', date: '', livestockType: '', count: '', species: '', location: '', description: '' };

export default function LivestockLossPage() {
  const [losses, setLosses] = useState([]);
  const [form, setForm]     = useState(INIT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [tab, setTab]       = useState('form'); // 'form' | 'history'

  useEffect(() => { getLivestockLosses().then(r => setLosses(r.data)); }, []);

  function validate() {
    const e = {};
    if (!form.village)       e.village       = 'Village is required.';
    if (!form.date)          e.date          = 'Date is required.';
    if (!form.livestockType) e.livestockType = 'Livestock type is required.';
    if (!form.count || form.count < 1) e.count = 'Number of animals must be at least 1.';
    if (!form.description)   e.description   = 'Description is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await submitLivestockLoss(form);
      setResult(res);
      setForm(INIT_FORM);
      setTab('history');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-green-600';

  function Field({ label, error, children }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        {children}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <DemoDataBanner />
      <div>
        <h1 className="text-2xl font-bold text-white">Livestock Loss Claims</h1>
        <p className="text-sm text-gray-400 mt-1">File a predation-related livestock loss claim for government compensation.</p>
      </div>

      {result && (
        <div className="bg-green-950/50 border border-green-700 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">...</span>
          <div>
            <p className="font-semibold text-green-300">Claim Submitted</p>
            <p className="text-sm text-gray-400 mt-1">Claim ID: <span className="font-mono text-white">{result.id}</span> ?? Status: <span className="text-yellow-300">SUBMITTED</span></p>
            <p className="text-xs text-gray-500 mt-1">A field verification officer will contact you within 3 working days.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {[['form','New Claim'], ['history','Claim History']].map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-green-800 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Village *" error={errors.village}>
              <select value={form.village} onChange={e => setForm(f => ({...f, village: e.target.value}))} className={inputCls}>
                <option value="">Select village...</option>
                {VILLAGE_OPTS.map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Date of Loss *" error={errors.date}>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={inputCls} />
            </Field>
            <Field label="Livestock Type *" error={errors.livestockType}>
              <select value={form.livestockType} onChange={e => setForm(f => ({...f, livestockType: e.target.value}))} className={inputCls}>
                <option value="">Select type...</option>
                {LIVESTOCK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Number of Animals *" error={errors.count}>
              <input type="number" min="1" placeholder="e.g. 2" value={form.count} onChange={e => setForm(f => ({...f, count: e.target.value}))} className={inputCls} />
            </Field>
            <Field label="Suspected Animal">
              <select value={form.species} onChange={e => setForm(f => ({...f, species: e.target.value}))} className={inputCls}>
                <option value="">Unknown / Select...</option>
                {SPECIES_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Approximate Location">
              <input type="text" placeholder="Near water source, field number..." value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputCls} />
            </Field>
          </div>
          <Field label="Description *" error={errors.description}>
            <textarea rows={3} placeholder="Describe the incident, when and how it was discovered..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className={inputCls} />
          </Field>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Evidence Upload (Optional)</label>
            <div className="bg-gray-900 border border-dashed border-gray-600 rounded-lg px-4 py-5 text-center text-xs text-gray-500">
              ... Evidence upload available in Phase 2 (IBM Cloud Object Storage)
            </div>
          </div>
          <div className="bg-amber-950/40 border border-amber-700/40 rounded-lg px-3 py-2 text-xs text-amber-400">
            ... DEMO FORM ... No actual government submission. This is a frontend prototype.
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
            {submitting ? 'Submitting...' : 'Submit Livestock Loss Claim'}
          </button>
        </form>
      )}

      {tab === 'history' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <SectionHeader title="Claim History" subtitle="Recent livestock loss submissions" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-700">
                  <th className="text-left py-2 pr-3">ID</th>
                  <th className="text-left py-2 pr-3">Village</th>
                  <th className="text-left py-2 pr-3">Type</th>
                  <th className="text-left py-2 pr-3 hidden sm:table-cell">Count</th>
                  <th className="text-left py-2 pr-3 hidden md:table-cell">Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {losses.map(l => (
                  <tr key={l.id} className="border-b border-gray-700/40 hover:bg-gray-700/30">
                    <td className="py-2 pr-3 font-mono text-xs text-gray-500">{l.id}</td>
                    <td className="py-2 pr-3 text-gray-200">{l.village}</td>
                    <td className="py-2 pr-3 text-gray-400">{l.livestockType}</td>
                    <td className="py-2 pr-3 text-gray-400 hidden sm:table-cell">{l.count}</td>
                    <td className="py-2 pr-3 text-gray-500 text-xs hidden md:table-cell">{l.date}</td>
                    <td className="py-2"><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
