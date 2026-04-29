import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LiteWizard({ liteQuestions, responses, onChange, onComplete, onBack }) {
  const ordered = useMemo(() => {
    // Group by category, then take 2 per category preserving JSON order
    const byCat = {};
    for (const q of liteQuestions) {
      if (!byCat[q.category]) byCat[q.category] = [];
      byCat[q.category].push(q);
    }
    const flat = [];
    for (const cat of Object.keys(byCat)) {
      flat.push(...byCat[cat]);
    }
    return flat;
  }, [liteQuestions]);

  const [index, setIndex] = useState(() => {
    const firstUnansweredIdx = ordered.findIndex((q) => responses[q.id] == null);
    return firstUnansweredIdx === -1 ? Math.max(0, ordered.length - 1) : firstUnansweredIdx;
  });

  if (ordered.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-slate-400">
        Loading questions…
      </div>
    );
  }

  const current = ordered[index];
  const total = ordered.length;
  const answeredCount = ordered.filter((q) => responses[q.id] != null).length;
  const progressPercent = Math.round((answeredCount / total) * 100);

  const select = (score) => {
    onChange(current.id, score);
    if (index < total - 1) {
      setTimeout(() => setIndex((i) => i + 1), 220);
    }
  };

  const allAnswered = ordered.every((q) => responses[q.id] != null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto mt-12">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Question {index + 1} of {total}
          </span>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            ← Cancel
          </button>
        </div>
        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        {current.category}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 leading-snug">
        {current.prompt}
      </h3>

      <div role="radiogroup" aria-label="Select level" className="space-y-3 mb-6">
        {current.levels.map((levelText, i) => {
          const value = i + 1;
          const isSelected = responses[current.id] === value;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              onClick={() => select(value)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {value}
              </div>
              <span className={`text-sm leading-relaxed ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                {levelText}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {index < total - 1 ? (
          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={responses[current.id] == null}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!allAnswered}
            className="px-5 py-2 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            See my results →
          </button>
        )}
      </div>
    </div>
  );
}
