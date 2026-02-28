/**
 * HeroScoreCard — prominent overall score display with radial gauge and category breakdown.
 */
import React from 'react';
import { TrendingUp, Target, Clock } from 'lucide-react';

const CATEGORY_SHORT = {
  'AI Readiness: Business Strategy': 'Business Strategy',
  'AI Readiness: Organization and Culture': 'Org & Culture',
  'AI Readiness: AI Strategy and Experience': 'AI Strategy',
  'AI Readiness: Data Foundations': 'Data Foundations',
  'AI Readiness: AI Governance and Security': 'Governance',
  'AI Readiness: Infrastructure for AI': 'Infrastructure',
  'AI Readiness: Model Management': 'Model Mgmt',
};

/** Return a colour on the red → yellow → green gradient based on percentage */
function getBarColor(p) {
  if (p === null || p === undefined) return '#cbd5e1'; // slate-300
  if (p <= 33) return '#ef4444';  // red
  if (p <= 65) return '#f59e0b';  // amber/yellow
  return '#10b981';               // green
}

function RadialGauge({ percent, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = percent ?? 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth="12"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={getBarColor(percent)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-slate-900">
          {percent !== null && percent !== undefined ? `${percent}%` : '—'}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Overall Score</span>
      </div>
    </div>
  );
}

function CategoryBar({ name, percent }) {
  const width = percent !== null && percent !== undefined ? percent : 0;
  const color = getBarColor(percent);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-28 sm:w-32 shrink-0 truncate" title={name}>
        {CATEGORY_SHORT[name] || name}
      </span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 w-10 text-right">
        {percent !== null && percent !== undefined ? `${percent}%` : '—'}
      </span>
    </div>
  );
}

export default function HeroScoreCard({ milestones, categories }) {
  const latest = milestones?.length > 0 ? milestones[milestones.length - 1] : null;
  const overallPercent = latest?.scores?.overall?.percent ?? null;
  const answeredCount = latest?.scores?.overall?.answered ?? 0;
  const lastUpdated = latest?.updated_at;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 px-6 py-3">
        <h2 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
          <Target size={16} /> AI Readiness Overview
        </h2>
      </div>

      <div className="p-6">
        {/* Evenly-split 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Radial gauge — centred with RAG badge */}
          <div className="flex flex-col items-center justify-center gap-3">
            <RadialGauge percent={overallPercent} size={180} />
            <RagBadge percent={overallPercent} />
          </div>

          {/* Category breakdown */}
          <div className="w-full space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Category Breakdown</h3>
            {categories.map((cat) => {
              const catScore = latest?.scores?.categories?.[cat];
              return (
                <CategoryBar
                  key={cat}
                  name={cat}
                  percent={catScore?.percent ?? null}
                />
              );
            })}
          </div>

          {/* Stats column — 3 cards stacked */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 w-full">
            <StatCard
              icon={TrendingUp}
              label="Milestones"
              value={milestones?.length || 0}
              color="blue"
            />
            <StatCard
              icon={Target}
              label="Questions Answered"
              value={answeredCount}
              color="violet"
            />
            <StatCard
              icon={Clock}
              label="Last Updated"
              value={lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
              color="amber"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RagBadge({ percent }) {
  if (percent === null || percent === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-xs font-bold">
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        Not Assessed
      </span>
    );
  }
  const cfg = percent <= 33
    ? { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200', label: 'Needs Attention' }
    : percent <= 65
    ? { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200', label: 'Developing' }
    : { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200', label: 'On Track' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text} text-xs font-bold`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-900',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className={`rounded-lg p-3 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="opacity-60" />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      </div>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
