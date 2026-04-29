import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

export default function AssessmentIntro({ onStartLite, onStartFull }) {
  return (
    <div className="max-w-4xl mx-auto -mt-24 relative z-20">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Lite */}
        <button
          onClick={onStartLite}
          className="group bg-white rounded-xl shadow-xl border-2 border-blue-900 p-8 text-left hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
            <Clock size={14} /> 5 minutes
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">Lite check</div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            10 questions across 5 dimensions. Get an instant readiness snapshot.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 group-hover:gap-3 transition-all">
            Start now <ArrowRight size={16} />
          </div>
        </button>

        {/* Full */}
        <button
          onClick={onStartFull}
          className="group bg-white rounded-xl shadow-md border border-slate-200 p-8 text-left hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Clock size={14} /> 15 minutes
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">Full assessment</div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            All 50 questions. The same depth our paying clients use in advisory engagements.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:gap-3 group-hover:text-blue-900 transition-all">
            Start full <ArrowRight size={16} />
          </div>
        </button>
      </div>
    </div>
  );
}
