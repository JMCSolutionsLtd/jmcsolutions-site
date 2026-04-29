import React from 'react';
import { Sparkles, Clock, BarChart3 } from 'lucide-react';

export default function AssessmentIntro({ onStartLite, onStartFull }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-900 mb-4">
            <Sparkles size={26} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            5 minutes. 5 dimensions. Real insight.
          </h3>
          <p className="text-base text-slate-600">
            Take the lite check below and get an instant readiness snapshot. Want a deeper picture?{' '}
            <button
              onClick={onStartFull}
              className="text-blue-700 hover:text-blue-900 font-bold underline-offset-4 hover:underline"
            >
              Got 15 minutes? Take the full assessment instead →
            </button>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-7">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-1">
              <Clock size={18} />
            </div>
            <div className="text-xs font-bold text-slate-700">5 min</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-1">
              <BarChart3 size={18} />
            </div>
            <div className="text-xs font-bold text-slate-700">10 questions</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-1">
              <Sparkles size={18} />
            </div>
            <div className="text-xs font-bold text-slate-700">Free results</div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onStartLite}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors"
          >
            Start the lite check →
          </button>
        </div>
      </div>
    </div>
  );
}
