import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { categoryColorClass } from './scoring';

const REPRESENTATIVE_QUESTION_ID = {
  'Business Strategy & Goals': 'bs-01',
  'People & Culture': 'oc-01',
  'Data & Content Foundations': 'df-01',
  'Governance & Risk': 'gs-01',
  'Technology Readiness': 'ti-02',
  'Technology & Microsoft 365 Readiness': 'ti-02',
};

const NEXT_STEPS = {
  'Business Strategy & Goals':
    "Define 1–3 high-impact use cases tied to measurable business outcomes — that's the single highest-leverage move at any maturity level.",
  'People & Culture':
    'Identify 3–5 internal AI champions across departments and equip them with structured training first; bottom-up adoption follows.',
  'Data & Content Foundations':
    'Run a content lifecycle audit before any AI rollout — your AI assistant is only as good as the data it can reach and trust.',
  'Governance & Risk':
    'Stand up a lightweight AI usage policy covering acceptable use, data handling, and human-review thresholds — even one page is enough to start.',
  'Technology Readiness':
    "Pilot a single AI-enabled workflow with a small team before scaling — you'll surface integration and licensing gaps cheaply.",
  'Technology & Microsoft 365 Readiness':
    "Pilot a single AI-enabled workflow with a small team before scaling — you'll surface integration and licensing gaps cheaply.",
};

export default function DetailedResults({ scores, questions, mode, email, onTakeFull, onRestart, onBookCall }) {
  const [expanded, setExpanded] = useState(() => new Set(Object.keys(scores.categories || {})));
  const toggle = (cat) => {
    const next = new Set(expanded);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpanded(next);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
        <strong>Detailed analysis below</strong> — a copy is on its way to <span className="font-mono">{email}</span>.
      </div>

      {mode === 'lite' && (
        <div className="bg-blue-900 text-white rounded-xl p-6 sm:p-8">
          <h4 className="text-xl font-bold mb-2">Want the full picture?</h4>
          <p className="text-sm text-blue-100 mb-4">
            You answered 10 questions across 5 areas. Take the full 50-question assessment for a deeper, more accurate snapshot.
          </p>
          <button
            onClick={onTakeFull}
            className="px-5 py-2.5 rounded-lg bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            Take the full assessment <ArrowRight size={16} />
          </button>
        </div>
      )}

      {Object.entries(scores.categories || {}).map(([cat, d]) => {
        const repId = REPRESENTATIVE_QUESTION_ID[cat];
        const repQ = questions.find((q) => q.id === repId);
        const avgScore = d.sum != null && d.answered
          ? Math.round(d.sum / d.answered)
          : Math.round((d.percent / 100) * 5);
        const currentLevelText = repQ?.levels?.[Math.min(4, Math.max(0, avgScore - 1))];
        const goodLevelText = repQ?.levels?.[4];
        const isExpanded = expanded.has(cat);
        const nextStep = NEXT_STEPS[cat] || '';
        return (
          <div key={cat} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(cat)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div className="flex-1 mr-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-lg font-bold text-slate-900">{cat}</h4>
                  <span className="text-lg font-bold text-slate-900">{d.percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoryColorClass(d.percent)}`}
                    style={{ width: `${d.percent}%` }}
                  />
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                {currentLevelText && (
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Where you are now</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{currentLevelText}</p>
                  </div>
                )}
                {goodLevelText && (
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">What good looks like</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{goodLevelText}</p>
                  </div>
                )}
                {nextStep && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Suggested next step</div>
                    <p className="text-sm text-amber-900 leading-relaxed">{nextStep}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-white border-2 border-blue-900 rounded-xl p-6 sm:p-8 text-center">
        <h4 className="text-xl font-bold text-slate-900 mb-2">Want personalised guidance?</h4>
        <p className="text-sm text-slate-600 mb-4">
          Our team will review your results and walk you through specific recommendations on a free 30-minute Discovery Call.
        </p>
        <button
          onClick={onBookCall}
          className="px-6 py-3 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
        >
          Book a Discovery Call <ArrowRight size={16} />
        </button>
      </div>

      <div className="text-center pt-2">
        <button onClick={onRestart} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
          Restart assessment
        </button>
      </div>
    </div>
  );
}
