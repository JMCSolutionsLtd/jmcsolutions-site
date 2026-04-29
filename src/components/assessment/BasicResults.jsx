import React from 'react';
import { categoryColorClass, categoryLabel } from './scoring';

export default function BasicResults({ scores, mode }) {
  const overall = scores.overall?.percent ?? 0;
  const categories = scores.categories || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
          {mode === 'lite' ? 'Lite Snapshot' : 'Full Assessment'}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Your AI Readiness Snapshot</h3>
        <div className="text-6xl font-bold text-blue-900 leading-none">{overall}%</div>
        <p className="text-sm text-slate-500 mt-2">Overall readiness across {scores.overall?.answered ?? 0} questions</p>
      </div>

      <div className="space-y-4">
        {Object.entries(categories).map(([cat, d]) => (
          <div key={cat}>
            <div className="flex justify-between items-baseline mb-1">
              <div className="text-sm font-bold text-slate-900 truncate pr-3">{cat}</div>
              <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{d.percent}%</div>
            </div>
            <div
              className="h-3 bg-slate-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={d.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${cat} readiness`}
            >
              <div
                className={`h-full ${categoryColorClass(d.percent)} transition-all duration-700`}
                style={{ width: `${d.percent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">{categoryLabel(d.percent)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
