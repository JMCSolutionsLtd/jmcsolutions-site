/**
 * ProgressChart — line charts showing score(s) over milestones using Recharts.
 */
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

const CATEGORY_COLORS = [
  '#1e3a8a', // blue-900
  '#dc2626', // red-600
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
];

const CHART_HEIGHT = 300;

/** Shared label formatter for milestone x-axis ticks */
function milestoneTick(value, index) {
  return `M${index + 1}`;
}

/** Custom tooltip wrapper */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
          <span className="text-slate-500">{p.name || 'Overall'}:</span>
          <span className="font-bold text-slate-800">{p.value != null ? `${p.value}%` : 'N/A'}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * OverallProgressChart — area chart showing overall % over milestones.
 */
export function OverallProgressChart({ milestones }) {
  const data = milestones.map((m, i) => ({
    name: m.title,
    milestone: `Milestone ${i + 1}`,
    overall: m.scores?.overall?.percent ?? null,
  }));

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
        {/* RAG threshold zones */}
        <ReferenceArea y1={0} y2={33} fill="#fecaca" fillOpacity={0.3} />
        <ReferenceArea y1={33} y2={65} fill="#fde68a" fillOpacity={0.28} />
        <ReferenceArea y1={65} y2={100} fill="#a7f3d0" fillOpacity={0.3} />
        {/* Threshold lines */}
        <ReferenceLine y={33} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
        <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tickFormatter={milestoneTick}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
          label={{ value: 'Milestone', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="overall"
          stroke="#1e3a8a"
          strokeWidth={3}
          fill="none"
          dot={{ r: 5, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7, stroke: '#1e3a8a', strokeWidth: 2, fill: '#fff' }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * CategoryProgressChart — multiple lines, one per category, over milestones.
 */
export function CategoryProgressChart({ milestones, categories }) {
  const data = milestones.map((m, i) => {
    const point = { name: m.title, milestone: `Milestone ${i + 1}` };
    for (const cat of categories) {
      point[cat] = m.scores?.categories?.[cat]?.percent ?? null;
    }
    return point;
  });

  const shortLabel = (cat) => cat;

  return (
    <>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tickFormatter={milestoneTick}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            label={{ value: 'Milestone', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip content={<ChartTooltip />} />
          {categories.map((cat, idx) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-4 px-1">
        {categories.map((cat, idx) => (
          <div key={cat} className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 rounded-full"
              style={{ width: 10, height: 10, backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
            />
            <span className="text-[11px] text-slate-500 truncate">{shortLabel(cat)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
