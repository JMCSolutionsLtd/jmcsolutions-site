/**
 * AdoptionStats — AI adoption statistics cards.
 * Currently displays placeholder metrics with animated mini-bar charts.
 * TODO: Connect to real analytics data source when available.
 */
import React from 'react';
import { Users, Zap, MessageSquareText, Clock } from 'lucide-react';

const STATS = [
  {
    key: 'active_users',
    label: 'Active Copilot Users',
    icon: Users,
    value: '-',
    change: null,
    color: 'blue',
    bars: [30, 45, 35, 55, 50, 65, 60],
  },
  {
    key: 'automations',
    label: 'Automations Running',
    icon: Zap,
    value: '-',
    change: null,
    color: 'violet',
    bars: [20, 30, 25, 40, 35, 45, 50],
  },
  {
    key: 'prompt_usage',
    label: 'Avg. Prompts / Day',
    icon: MessageSquareText,
    value: '-',
    change: null,
    color: 'emerald',
    bars: [40, 35, 50, 45, 60, 55, 70],
  },
  {
    key: 'time_saved',
    label: 'Time Saved (hrs/mo)',
    icon: Clock,
    value: '-',
    change: null,
    color: 'amber',
    bars: [25, 30, 40, 35, 50, 45, 55],
  },
];

const COLOR_MAP = {
  blue: { bar: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-600' },
  violet: { bar: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-900', icon: 'text-violet-600' },
  emerald: { bar: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-900', icon: 'text-emerald-600' },
  amber: { bar: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-600' },
};

export default function AdoptionStats() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {STATS.map((stat) => {
        const c = COLOR_MAP[stat.color] || COLOR_MAP.blue;
        const Icon = stat.icon;
        const maxBar = Math.max(...stat.bars);

        return (
          <div key={stat.key} className={`rounded-lg p-4 ${c.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={c.icon} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-black ${c.text}`}>{stat.value}</p>
                {stat.change !== null && (
                  <span className="text-xs font-bold text-emerald-600">+{stat.change}%</span>
                )}
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-0.5 h-10">
                {stat.bars.map((h, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-sm ${c.bar} opacity-60`}
                    style={{ height: `${(h / maxBar) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <p className="sm:col-span-2 text-[10px] text-slate-400 text-center mt-1">
        Placeholder data. Connect to your analytics source to populate live metrics
      </p>
    </div>
  );
}

/** Helper for CSV export */
export function getAdoptionExportData() {
  return STATS.map((s) => ({ Metric: s.label, Value: s.value, Change: s.change ? `+${s.change}%` : '' }));
}
