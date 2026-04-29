import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AIAssessment from './AIAssessment';

export default function AssessmentPage({ onBack }) {
  return (
    <div className="min-h-screen">
      {/* Hero band */}
      <section className="pt-32 pb-12 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-blue-900/85 mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </button>
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
            AI Readiness Assessment
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            How AI-Ready Is Your Business?
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">
            A free, immediate snapshot of where you sit across 5 readiness dimensions. Take the 5-minute lite check or go deeper with the full 15-minute assessment.
          </p>
        </div>
      </section>

      {/* Assessment body */}
      <section className="py-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">
          <AIAssessment />
        </div>
      </section>
    </div>
  );
}
