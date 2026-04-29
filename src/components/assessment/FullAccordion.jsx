import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export default function FullAccordion({ questions, responses, onChange, onComplete, onBack }) {
  const categories = [];
  const seen = new Set();
  for (const q of questions) {
    if (!seen.has(q.category)) {
      seen.add(q.category);
      categories.push(q.category);
    }
  }
  const byCategory = Object.fromEntries(categories.map((c) => [c, questions.filter((q) => q.category === c)]));

  const [expanded, setExpanded] = useState(() => new Set([categories[0]]));
  const [hoverLevel, setHoverLevel] = useState({});

  const toggle = (cat) => {
    const next = new Set(expanded);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpanded(next);
  };

  const totalAnswered = questions.filter((q) => responses[q.id] != null).length;
  const total = questions.length;
  const allAnswered = totalAnswered === total;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Cancel
        </button>
        <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
          Full Assessment — {totalAnswered} of {total} answered
        </div>
      </div>

      {categories.map((cat) => {
        const qs = byCategory[cat];
        const catAnswered = qs.filter((q) => responses[q.id] != null).length;
        const isComplete = catAnswered === qs.length;
        const isExpanded = expanded.has(cat);
        return (
          <div
            key={cat}
            className={`mb-3 rounded-xl border bg-white shadow-sm transition-all ${
              isComplete ? 'border-emerald-300' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
                <h4 className="text-lg font-bold text-slate-900">{cat}</h4>
                <span className="text-xs font-semibold text-slate-500">
                  {catAnswered} / {qs.length}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5">
                {qs.map((q) => {
                  const selected = responses[q.id];
                  const hovered = hoverLevel[q.id];
                  const showLevelText = hovered != null ? hovered : selected;
                  return (
                    <div key={q.id} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                      <p className="text-sm font-semibold text-slate-900 mb-3">{q.prompt}</p>
                      <div role="radiogroup" aria-label={q.prompt} className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((v) => {
                          const isSel = selected === v;
                          return (
                            <button
                              key={v}
                              role="radio"
                              aria-checked={isSel}
                              onClick={() => onChange(q.id, v)}
                              onMouseEnter={() => setHoverLevel((s) => ({ ...s, [q.id]: v }))}
                              onMouseLeave={() => setHoverLevel((s) => ({ ...s, [q.id]: null }))}
                              className={`flex-1 sm:flex-none sm:w-12 h-12 rounded-lg font-bold text-sm border-2 transition-all ${
                                isSel
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                      {showLevelText && (
                        <p className="text-xs text-slate-500 leading-relaxed mt-2 italic">
                          {q.levels[showLevelText - 1]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto bg-blue-900 text-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Progress</div>
            <div className="text-base font-bold">
              {totalAnswered} of {total} questions answered
            </div>
          </div>
          <button
            onClick={onComplete}
            disabled={!allAnswered}
            className="px-5 py-2 rounded-lg bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            See my results →
          </button>
        </div>
      </div>
    </div>
  );
}
