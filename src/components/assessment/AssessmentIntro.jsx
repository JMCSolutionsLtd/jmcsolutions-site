import React from 'react';
import { ArrowRight, Clock, Sparkles, FileText, Mail } from 'lucide-react';

const DIMENSIONS = [
  {
    num: '01',
    title: 'Business Strategy',
    desc: 'How AI fits your goals, investment plan, prioritised use cases, and success metrics.',
  },
  {
    num: '02',
    title: 'People & Culture',
    desc: 'Adoption readiness, change management, training, and internal champions.',
  },
  {
    num: '03',
    title: 'Data Foundations',
    desc: 'Quality, organisation, governance, and accessibility of the data AI relies on.',
  },
  {
    num: '04',
    title: 'Governance & Risk',
    desc: 'Policies, ethical guardrails, oversight, and incident response for AI use.',
  },
  {
    num: '05',
    title: 'Technology Readiness',
    desc: 'Infrastructure, integrations, identity, and tooling that enables AI to operate.',
  },
];

const DELIVERABLES = [
  {
    icon: Sparkles,
    title: 'Instant scored snapshot',
    desc: 'Overall readiness percentage and per-dimension scoring shown on screen as soon as you complete the questions.',
  },
  {
    icon: FileText,
    title: 'Detailed analysis',
    desc: 'Where you sit today, what level five looks like, and the suggested next step for each readiness dimension.',
  },
  {
    icon: Mail,
    title: 'Personal review by our team',
    desc: 'A copy of your results emailed to you, plus a follow-up from JMC Solutions if you would like a guided discussion.',
  },
];

export default function AssessmentIntro({ onStartLite, onStartFull }) {
  return (
    <div className="-mt-32 relative z-20">
      {/* Option cards */}
      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5">
        <button
          onClick={onStartLite}
          className="group relative bg-white rounded-xl shadow-2xl p-8 sm:p-10 text-left hover:-translate-y-1 transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900" />
          <div className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
            Recommended
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-900 tracking-widest mb-4">
            <Clock size={13} /> 3 MIN · 10 QUESTIONS
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">
            Lite check
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            A representative slice across all 5 dimensions. Designed for executives who want a defensible snapshot before committing time to a deeper diagnostic.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 group-hover:gap-3 transition-all">
            Start now <ArrowRight size={16} />
          </div>
        </button>

        <button
          onClick={onStartFull}
          className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-10 text-left hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 tracking-widest mb-4">
            <Clock size={13} /> 15 MIN · 50 QUESTIONS
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">
            Full assessment
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            The complete diagnostic — the same instrument JMC Solutions uses inside paying client engagements. Best when you are seriously planning rollout.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-blue-900 group-hover:gap-3 transition-all">
            Start full assessment <ArrowRight size={16} />
          </div>
        </button>
      </div>

      {/* Methodology — Five Dimensions */}
      <div className="mt-24 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-blue-900 tracking-widest mb-3">02 / METHODOLOGY</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
            Five dimensions of AI readiness
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            The questions are organised across five interlocking dimensions. Strength in any one alone is not enough — sustainable AI adoption requires balance across all five.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {DIMENSIONS.map((d) => (
            <div key={d.num} className="bg-white p-6 sm:p-7">
              <div className="text-xs font-mono text-blue-900 tracking-widest mb-4">{d.num}</div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-tight">{d.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What you receive */}
      <div className="mt-20 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-blue-900 tracking-widest mb-3">03 / DELIVERABLE</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
            What you'll receive
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {DELIVERABLES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-slate-200 p-7 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-5">
                <Icon size={20} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Authority footer */}
      <div className="mt-20 max-w-3xl mx-auto text-center">
        <div className="h-px w-16 bg-blue-900 mx-auto mb-6" />
        <p className="text-sm text-slate-500 leading-relaxed">
          Designed and maintained by JMC Solutions. The diagnostic is updated continuously as we learn from new client engagements across Microsoft Copilot, Claude, and broader AI adoption programmes.
        </p>
      </div>
    </div>
  );
}
