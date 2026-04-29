import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AIAssessment from './AIAssessment';

export default function AssessmentPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="pt-28 pb-44 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-blue-900/90 mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white mt-6 mb-12 transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          <div className="grid lg:grid-cols-12 gap-12 items-end">
            {/* Left — editorial copy */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-mono text-blue-300 tracking-widest">01 / DIAGNOSTIC</span>
                <span className="h-px flex-1 max-w-[80px] bg-blue-700" />
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Free</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                How AI-Ready<br />Is Your Business?
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mb-8">
                A structured diagnostic across the five dimensions that determine whether AI adoption will deliver measurable value, or quietly stall after the first pilot.
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-blue-200">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  Calibrated through real client engagements
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  Updated for Microsoft Copilot &amp; Claude
                </span>
              </div>
            </div>

            {/* Right — credibility ledger (desktop only) */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="border-l border-blue-700 pl-6 space-y-6">
                <div>
                  <div className="text-4xl font-bold text-white leading-none">5</div>
                  <div className="text-xs text-blue-300 uppercase tracking-wider mt-1">Readiness dimensions</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white leading-none">50</div>
                  <div className="text-xs text-blue-300 uppercase tracking-wider mt-1">Calibrated questions</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white leading-none">~3 min</div>
                  <div className="text-xs text-blue-300 uppercase tracking-wider mt-1">Lite check</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="pb-20 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">
          <AIAssessment />
        </div>
      </section>
    </div>
  );
}
