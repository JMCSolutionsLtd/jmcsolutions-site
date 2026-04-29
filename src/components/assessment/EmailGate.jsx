import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function EmailGate({ onSubmit, submitting, errorMessage }) {
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = firstName.trim() && company.trim() && isValidEmail && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ firstName: firstName.trim(), company: company.trim(), email: email.trim(), website });
  };

  return (
    <div className="bg-white rounded-xl border-l-4 border-blue-900 border-r border-t border-b border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto mt-6">
      <h4 className="text-xl font-bold text-slate-900 mb-2">Unlock your detailed analysis</h4>
      <p className="text-sm text-slate-600 mb-5">
        We'll send you a copy and our team will personally review your results to suggest specific next steps.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="ag-fn" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              First name
            </label>
            <input
              id="ag-fn"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ag-co" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company
            </label>
            <input
              id="ag-co"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ag-em" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Work email
            </label>
            <input
              id="ag-em"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }} aria-hidden="true">
          <label htmlFor="ag-hp">Website</label>
          <input
            id="ag-hp"
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {errorMessage && (
          <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Submitting…' : 'See my detailed analysis'}
        </button>

        <p className="text-xs text-slate-400 mt-3">
          By submitting you agree to receive your results and occasional follow-ups from JMC Solutions. You can unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
